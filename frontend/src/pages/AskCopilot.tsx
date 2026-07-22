import { useEffect, useRef, useState } from 'react'
import { ArrowRight, ChevronDown, History, Loader2, Maximize2, Square } from 'lucide-react'

import { PageHeader } from '@/components/PageHeader'
import {
  ComplianceReportView,
  HistoryDialog,
  RcaReportView,
} from '@/components/workflows/WorkflowViews'
import { Badge, StatusDot } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Modal } from '@/components/ui/modal'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { streamWorkflow } from '@/lib/api'
import { cn } from '@/lib/utils'
import type { ChatResult, Citation, ComplianceResult, RcaResult } from '@/lib/types'

const EXAMPLES = [
  'Summarize the most-referenced asset and flag any contradicting evidence.',
  'What recent incidents have been logged, and which assets do they affect?',
]

export function AskCopilot() {
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const [status, setStatus] = useState<string>('')
  const [answer, setAnswer] = useState('')
  const [result, setResult] = useState<ChatResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [asked, setAsked] = useState<string>('')
  // Live reasoning trace (streamed before the answer, Claude/ChatGPT-style).
  const [thinking, setThinking] = useState('')
  const [thoughtMs, setThoughtMs] = useState<number | null>(null)
  const thinkStartRef = useRef<number | null>(null)
  // A routed RCA/Compliance result opens as a workflow window over the chat.
  const [workflow, setWorkflow] = useState<ChatResult | null>(null)
  const [historyKind, setHistoryKind] = useState<'rca' | 'compliance' | null>(null)
  const abortRef = useRef<AbortController | null>(null)

  async function submit() {
    const message = input.trim()
    if (!message || streaming) return
    setStreaming(true)
    setAnswer('')
    setResult(null)
    setError(null)
    setThinking('')
    setThoughtMs(null)
    thinkStartRef.current = null
    setStatus('Routing your question')
    setAsked(message)
    const controller = new AbortController()
    abortRef.current = controller
    try {
      for await (const ev of streamWorkflow('/api/chat', { message }, controller.signal)) {
        if (ev.step === 'thinking') {
          if (thinkStartRef.current == null) thinkStartRef.current = Date.now()
          setThinking((t) => t + (ev.text ?? ''))
        } else if (ev.step === 'token') {
          if (thinkStartRef.current != null) {
            setThoughtMs((ms) => ms ?? Date.now() - (thinkStartRef.current as number))
          }
          setAnswer((a) => a + (ev.text ?? ''))
        } else if (ev.step === 'complete') {
          const r = (ev.result as ChatResult) ?? null
          setResult(r)
          // Open the full workflow window automatically for RCA / compliance.
          if (r && (r.intent === 'rca' || r.intent === 'compliance')) {
            setWorkflow(r)
          }
        } else if (ev.message) {
          setStatus(ev.message)
        }
      }
    } catch (e) {
      if (!(e instanceof DOMException && e.name === 'AbortError')) {
        setError(e instanceof Error ? e.message : 'Request failed')
      }
    } finally {
      setStreaming(false)
      abortRef.current = null
    }
  }

  function interrupt() {
    abortRef.current?.abort()
  }

  const started = streaming || !!answer || !!result || !!error

  return (
    <>
      <PageHeader
        eyebrow="Grounded in the evidence set"
        title="Ask Copilot"
        description="Get a traceable answer. Every citation returns to the same graph records — and contradicting evidence is shown, not hidden."
      />

      <Card className="mb-6 gap-4 py-5">
        <div className="px-5">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit()
            }}
            placeholder="Ask about an asset, a failure, a permit clause, or how records connect…"
            rows={3}
            disabled={streaming}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 px-5">
          <div className="flex flex-wrap gap-2">
            {EXAMPLES.map((ex) => (
              <button
                key={ex}
                onClick={() => setInput(ex)}
                disabled={streaming}
                className="rounded-full border border-border bg-card px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground disabled:opacity-50"
              >
                {ex.length > 42 ? ex.slice(0, 42) + '…' : ex}
              </button>
            ))}
          </div>
          <Button onClick={submit} disabled={streaming || !input.trim()}>
            {streaming ? <Loader2 className="animate-spin" /> : <ArrowRight />}
            Ask Copilot
          </Button>
        </div>
      </Card>

      {started && (
        <Card className="gap-5 py-6">
          <div className="flex items-start justify-between gap-4 px-6">
            <div className="min-w-0">
              <h2 className="text-base font-semibold">Working assessment</h2>
              {asked && (
                <p className="mt-0.5 truncate text-sm text-muted-foreground">
                  {asked}
                </p>
              )}
            </div>
            {streaming ? (
              <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-primary">
                <StatusDot className="motion-safe:animate-pulse" />
                Answer in progress
              </span>
            ) : (
              !error && (
                <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-verified">
                  <StatusDot tone="verified" />
                  Answer complete
                </span>
              )
            )}
          </div>

          <div className="space-y-4 px-6">
            <ThinkingTrace
              text={thinking}
              active={streaming && !answer}
              thoughtMs={thoughtMs}
            />
            {error ? (
              <p className="text-sm text-critical">{error}</p>
            ) : (
              <>
                {streaming && !answer && !thinking && (
                  <p className="text-sm text-muted-foreground">{status}…</p>
                )}
                {answer && <AnswerBody text={answer} />}
                {!streaming && result && !answer && (
                  <RoutedResult result={result} />
                )}
              </>
            )}
          </div>

          {streaming && (
            <div className="px-6">
              <Button variant="outline" size="sm" onClick={interrupt}>
                <Square className="fill-current" />
                Interrupt stream
              </Button>
            </div>
          )}

          {!streaming && result && (result.intent === 'ask' || result.intent === 'asset_lookup') && (
            <AssessmentDetails result={result} />
          )}

          {!streaming && result && (result.intent === 'rca' || result.intent === 'compliance') && (
            <div className="flex flex-wrap gap-2 px-6">
              <Button variant="outline" size="sm" onClick={() => setWorkflow(result)}>
                <Maximize2 />
                {result.intent === 'rca' ? 'Open root-cause window' : 'Open compliance window'}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setHistoryKind(result.intent as 'rca' | 'compliance')}
              >
                <History />
                History
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* Workflow window overlaid on the chat background (per request) */}
      <Modal
        open={!!workflow}
        onClose={() => setWorkflow(null)}
        title={workflow?.intent === 'rca' ? 'Root cause analysis' : 'Compliance review'}
        description={asked || undefined}
        className="sm:max-w-2xl"
      >
        {workflow && (
          <div className="space-y-4">
            {workflow.intent === 'rca' ? (
              <RcaReportView result={workflow as unknown as RcaResult} />
            ) : (
              <ComplianceReportView result={workflow as unknown as ComplianceResult} />
            )}
            <div className="flex flex-wrap gap-2 border-t border-border/60 pt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setHistoryKind(workflow.intent as 'rca' | 'compliance')}
              >
                <History />
                Previous runs
              </Button>
              <Button variant="ghost" size="sm" asChild>
                <a href={workflow.intent === 'rca' ? '/workflows/rca' : '/workflows/compliance'}>
                  Open full workflow page
                  <ArrowRight />
                </a>
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {historyKind && (
        <HistoryDialog
          kind={historyKind}
          open={!!historyKind}
          onClose={() => setHistoryKind(null)}
        />
      )}
    </>
  )
}

/** Collapsible live reasoning trace (streams before the answer, then collapses). */
function ThinkingTrace({
  text,
  active,
  thoughtMs,
}: {
  text: string
  active: boolean
  thoughtMs: number | null
}) {
  const [open, setOpen] = useState(true)
  const userToggled = useRef(false)
  // Auto-collapse once the answer starts, unless the user opened it themselves.
  useEffect(() => {
    if (!active && !userToggled.current) setOpen(false)
  }, [active])
  const bodyRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (open && active && bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight
  }, [text, open, active])

  if (!text) return null
  const label = active
    ? 'Thinking'
    : thoughtMs != null
      ? `Thought for ${(thoughtMs / 1000).toFixed(1)}s`
      : 'Thought process'

  return (
    <div className="rounded-xl border border-border/60 bg-secondary/40">
      <button
        onClick={() => {
          userToggled.current = true
          setOpen((o) => !o)
        }}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left"
        aria-expanded={open}
      >
        <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
          <StatusDot className={cn(active && 'motion-safe:animate-pulse')} />
          {label}
        </span>
        <ChevronDown
          className={cn(
            'size-4 text-muted-foreground transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div
          ref={bodyRef}
          className="max-h-52 overflow-auto border-t border-border/50 px-3.5 py-3"
        >
          <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-muted-foreground/90">
            {text}
          </p>
        </div>
      )}
    </div>
  )
}

/** Renders answer prose, turning [citation] markers into small chips. */
function AnswerBody({ text }: { text: string }) {
  const parts = text.split(/(\[[^\]]+\])/g)
  return (
    <p className="text-sm leading-7 text-foreground/90 whitespace-pre-wrap">
      {parts.map((p, i) =>
        /^\[[^\]]+\]$/.test(p) ? (
          <span
            key={i}
            className="mx-0.5 inline-flex items-center rounded-md bg-linked-soft px-1.5 py-0.5 align-baseline font-mono text-[11px] font-medium text-linked"
          >
            {p.slice(1, -1)}
          </span>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </p>
  )
}

function RoutedResult({ result }: { result: ChatResult }) {
  if (result.intent === 'rca' && result.report) {
    return (
      <div className="space-y-2">
        <p className="text-sm leading-relaxed">{result.report.summary}</p>
        <Button variant="outline" size="sm" asChild>
          <a href="/workflows/rca">
            Open full analysis <ArrowRight />
          </a>
        </Button>
      </div>
    )
  }
  if (result.intent === 'compliance' && result.narrative) {
    return <p className="text-sm leading-relaxed">{result.narrative.summary}</p>
  }
  if (result.intent === 'asset_lookup') {
    return (
      <p className="text-sm leading-relaxed">
        {result.answer ?? 'Asset found.'}
      </p>
    )
  }
  if (result.intent === 'overview') {
    return (
      <div className="space-y-3">
        <p className="text-sm leading-relaxed">{result.answer}</p>
        {result.assets && result.assets.length > 0 && (
          <ul className="divide-y divide-border/60 rounded-lg border border-border/60">
            {result.assets.map((a) => (
              <li
                key={a.unified_id}
                className="flex items-center justify-between gap-3 px-3 py-2 text-sm"
              >
                <span className="truncate">{a.asset_name || a.unified_id}</span>
                <span className="flex shrink-0 items-center gap-2">
                  {a.needs_review && <Badge variant="review">review</Badge>}
                  <span className="font-mono text-xs text-muted-foreground">
                    {a.unified_id}
                  </span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }
  return <p className="text-sm text-muted-foreground">No answer produced.</p>
}

function AssessmentDetails({ result }: { result: ChatResult }) {
  const [open, setOpen] = useState(false)
  const citations = normalizeCitations(result.citations)
  const confidence = Math.round((result.confidence ?? 0) * 100)
  const contradictions = result.contradictions ?? []

  return (
    <div className="border-t border-border/60 px-6 pt-4">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-medium"
      >
        Details: sources, confidence, and contradictions
        <ChevronDown
          className={cn('size-4 text-muted-foreground transition-transform', open && 'rotate-180')}
        />
      </button>

      {open && (
        <div className="mt-4 space-y-5">
          <div>
            <div className="mb-1.5 flex items-center justify-between text-xs text-muted-foreground">
              <span>Confidence</span>
              <span className="font-medium text-foreground">
                {confidence}% ·{' '}
                {confidence >= 75 ? 'High' : confidence >= 45 ? 'Moderate' : 'Low'}
              </span>
            </div>
            <Progress value={confidence} tone="verified" />
            <p className="mt-1.5 text-xs text-muted-foreground">
              {citations.length} source{citations.length === 1 ? '' : 's'} checked
              {contradictions.length
                ? ` · ${contradictions.length} contradiction${contradictions.length === 1 ? '' : 's'}`
                : ' · no contradictions found'}
            </p>
          </div>

          {citations.length > 0 && (
            <div>
              <p className="mb-2 text-xs font-medium text-muted-foreground">Sources</p>
              <div className="flex flex-wrap gap-2">
                {citations.map((c) => (
                  <Badge key={c.id} variant="linked" className="font-mono">
                    {c.id}
                    {c.similarity > 0 && (
                      <span className="opacity-60">{Math.round(c.similarity * 100)}%</span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {contradictions.length > 0 && (
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-xs font-medium text-critical">
                <StatusDot tone="critical" />
                Contradicting / unresolved evidence
              </p>
              <ul className="space-y-1.5">
                {contradictions.map((c, i) => (
                  <li
                    key={i}
                    className="rounded-lg bg-critical-soft px-3 py-2 text-sm text-foreground/80"
                  >
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function normalizeCitations(c: ChatResult['citations']): Citation[] {
  if (!c) return []
  return c.map((item) =>
    typeof item === 'string'
      ? { id: item, unified_id: null, system: '', similarity: 0 }
      : item,
  )
}
