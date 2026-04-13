/**
 * MiniMaxProvider - LLM provider for MiniMax (Anthropic-compatible API)
 *
 * MiniMax provides an Anthropic-compatible API endpoint at api.minimaxi.com
 * that accepts Anthropic SDK-format requests (/v1/messages).
 * This provider uses Anthropic SDK to communicate with MiniMax.
 */

import Anthropic from '@anthropic-ai/sdk';
import type { LLMProvider } from '../../types/settings';
import type { ApiHandler, ApiStream, ApiStreamChunk, MessageParam, ModelInfo } from '../types';
import type { ToolDefinition } from '../../core/tools/types';
import { getModelContextWindow } from '../../types/model-registry';
import type { IncomingMessage } from 'http';

const DEFAULT_BASE_URL = 'https://api.minimaxi.com/anthropic';

// #region Node.js fetch wrapper (bypasses CORS in Electron renderer)
function createNodeFetch(): typeof globalThis.fetch {
    return async (input: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
        const parsed = new URL(url);

        // eslint-disable-next-line @typescript-eslint/no-require-imports
        const https = require('https') as typeof import('https');

        return new Promise<Response>((resolve, reject) => {
            const headers: Record<string, string> = {};
            if (init?.headers) {
                if (init.headers instanceof Headers) {
                    init.headers.forEach((v, k) => { headers[k] = v; });
                } else if (Array.isArray(init.headers)) {
                    for (const [k, v] of init.headers) headers[k] = v;
                } else {
                    Object.assign(headers, init.headers);
                }
            }

            const req = https.request({
                hostname: parsed.hostname,
                port: parsed.port || 443,
                path: parsed.pathname + parsed.search,
                method: init?.method ?? 'GET',
                headers,
            }, (res: IncomingMessage) => {
                const body = new ReadableStream<Uint8Array>({
                    start(controller) {
                        res.on('data', (chunk: Buffer) => controller.enqueue(new Uint8Array(chunk)));
                        res.on('end', () => controller.close());
                        res.on('error', (err) => controller.error(err));
                    },
                    cancel() { res.destroy(); },
                });

                const responseHeaders = new Headers();
                for (const [key, value] of Object.entries(res.headers)) {
                    if (value) responseHeaders.set(key, Array.isArray(value) ? value.join(', ') : value);
                }

                resolve(new Response(body, {
                    status: res.statusCode ?? 500,
                    statusText: res.statusMessage ?? '',
                    headers: responseHeaders,
                }));
            });

            req.on('error', reject);

            if (init?.signal) {
                init.signal.addEventListener('abort', () => { req.destroy(); reject(new DOMException('Aborted', 'AbortError')); });
            }

            if (init?.body) {
                req.write(typeof init.body === 'string' ? init.body : init.body);
            }
            req.end();
        });
    };
}
// #endregion

export class MiniMaxProvider implements ApiHandler {
    private client: Anthropic;
    private config: LLMProvider;

    constructor(config: LLMProvider) {
        this.config = config;
        const baseURL = config.baseUrl ?? DEFAULT_BASE_URL;

        // Use Node.js https to bypass CORS in Electron renderer
        this.client = new Anthropic({
            apiKey: config.apiKey ?? '',
            baseURL,
            dangerouslyAllowBrowser: true,
            fetch: createNodeFetch(),
        });
    }

    getModel(): { id: string; info: ModelInfo } {
        const contextWindow = getModelContextWindow(this.config.model);

        return {
            id: this.config.model,
            info: {
                contextWindow,
                supportsTools: true,
                supportsStreaming: true,
            },
        };
    }

    async *createMessage(
        systemPrompt: string,
        messages: MessageParam[],
        tools: ToolDefinition[],
        abortSignal?: AbortSignal,
    ): ApiStream {
        // Convert MessageParam[] to Anthropic format
        const anthropicMessages = this.convertMessages(messages);

        // Convert ToolDefinition[] to Anthropic tool format
        const anthropicTools: Anthropic.Tool[] = tools.map((tool) => ({
            name: tool.name,
            description: tool.description,
            input_schema: tool.input_schema as Anthropic.Tool.InputSchema,
        }));

        // Extended thinking: when enabled, temperature MUST be 1, max_tokens >= budget_tokens
        const thinkingEnabled = this.config.thinkingEnabled ?? false;
        const budgetTokens = this.config.thinkingBudgetTokens ?? 10000;
        const effectiveTemperature = thinkingEnabled
            ? 1
            : Math.min(this.config.temperature ?? 0.2, 1.0);
        const effectiveMaxTokens = thinkingEnabled
            ? Math.max(this.config.maxTokens ?? 16384, budgetTokens)
            : (this.config.maxTokens ?? 8192);

        // Create streaming request
        const stream = this.client.messages.stream(
            {
                model: this.config.model,
                max_tokens: effectiveMaxTokens,
                system: systemPrompt,
                messages: anthropicMessages,
                tools: anthropicTools.length > 0 ? anthropicTools : undefined,
                tool_choice: anthropicTools.length > 0 ? { type: 'auto' } : undefined,
                ...(thinkingEnabled
                    ? { thinking: { type: 'enabled' as const, budget_tokens: budgetTokens } }
                    : {}),
            },
            { signal: abortSignal },
        );

        // Process stream - accumulate tool input JSON, yield complete tool_use
        const toolAccumulator = new Map<
            number,
            { id: string; name: string; inputJson: string }
        >();
        const thinkingAccumulator = new Map<number, { text: string }>();

        let inputTokens = 0;
        let outputTokens = 0;

        for await (const event of stream) {
            if (event.type === 'message_start') {
                inputTokens = event.message.usage.input_tokens;
            }

            if (event.type === 'message_delta') {
                outputTokens = event.usage.output_tokens;
            }

            if (event.type === 'content_block_start') {
                if (event.content_block.type === 'tool_use') {
                    toolAccumulator.set(event.index, {
                        id: event.content_block.id,
                        name: event.content_block.name,
                        inputJson: '',
                    });
                } else if (event.content_block.type === 'thinking') {
                    thinkingAccumulator.set(event.index, { text: '' });
                }
            }

            if (event.type === 'content_block_delta') {
                if (event.delta.type === 'text_delta') {
                    yield { type: 'text', text: event.delta.text } satisfies ApiStreamChunk;
                }

                if (event.delta.type === 'input_json_delta') {
                    const tool = toolAccumulator.get(event.index);
                    if (tool) tool.inputJson += event.delta.partial_json;
                }

                // Anthropic extended thinking delta
                if (event.delta.type === 'thinking_delta') {
                    const thinking = thinkingAccumulator.get(event.index);
                    if (thinking) {
                        thinking.text += event.delta.thinking;
                        yield { type: 'thinking', text: event.delta.thinking } satisfies ApiStreamChunk;
                    }
                }
            }

            if (event.type === 'content_block_stop') {
                thinkingAccumulator.delete(event.index);

                const tool = toolAccumulator.get(event.index);
                if (tool) {
                    let parsedInput: Record<string, unknown> = {};
                    try {
                        parsedInput = tool.inputJson ? JSON.parse(tool.inputJson) : {};
                    } catch (e) {
                        yield {
                            type: 'tool_error',
                            id: tool.id,
                            name: tool.name,
                            error: `Tool input parse error: ${(e as Error).message}`,
                        } satisfies ApiStreamChunk;
                        toolAccumulator.delete(event.index);
                        continue;
                    }

                    yield {
                        type: 'tool_use',
                        id: tool.id,
                        name: tool.name,
                        input: parsedInput,
                    } satisfies ApiStreamChunk;

                    toolAccumulator.delete(event.index);
                }
            }
        }

        // Yield token usage at the end
        if (inputTokens > 0 || outputTokens > 0) {
            yield {
                type: 'usage',
                inputTokens,
                outputTokens,
            } satisfies ApiStreamChunk;
        }
    }

    /**
     * Convert MessageParam[] to Anthropic MessageParam[]
     */
    private convertMessages(messages: MessageParam[]): Anthropic.MessageParam[] {
        return messages.map((msg) => {
            if (typeof msg.content === 'string') {
                return { role: msg.role, content: msg.content };
            }

            const content = msg.content.map((block) => {
                if (block.type === 'text') {
                    return { type: 'text' as const, text: block.text };
                }

                if (block.type === 'tool_use') {
                    return {
                        type: 'tool_use' as const,
                        id: block.id,
                        name: block.name,
                        input: block.input,
                    };
                }

                if (block.type === 'image') {
                    return {
                        type: 'image' as const,
                        source: {
                            type: 'base64' as const,
                            media_type: block.source.media_type,
                            data: block.source.data,
                        },
                    };
                }

                if (block.type === 'tool_result') {
                    return {
                        type: 'tool_result' as const,
                        tool_use_id: block.tool_use_id,
                        content: block.content,
                        is_error: block.is_error,
                    };
                }

                throw new Error(`Unknown content block type: ${(block as { type: string }).type}`);
            });

            return { role: msg.role, content } as Anthropic.MessageParam;
        });
    }

    /**
     * Quick non-streaming classification call.
     */
    async classifyText(prompt: string, abortSignal?: AbortSignal): Promise<string> {
        const response = await this.client.messages.create({
            model: this.config.model,
            max_tokens: 50,
            messages: [{ role: 'user', content: prompt }],
        }, {
            signal: abortSignal ?? undefined,
        });

        for (const block of response.content) {
            if (block.type === 'text') return block.text.trim();
        }
        return '';
    }
}
