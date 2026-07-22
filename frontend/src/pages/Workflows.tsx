import { Link } from 'react-router-dom'
import {
  ArrowRight,
  FileText,
  Radio,
  ShieldCheck,
  Upload,
  type LucideIcon,
} from 'lucide-react'

import { PageHeader } from '@/components/PageHeader'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

interface WF {
  to: string
  icon: LucideIcon
  title: string
  desc: string
  badge: React.ReactNode
  cta: string
}

const WORKFLOWS: WF[] = [
  {
    to: '/workflows/documents',
    icon: FileText,
    title: 'Ingest documents (PDF)',
    desc: 'Docling parses PDFs, stores each parse durably (chain-of-custody), then extracts and resolves assets, incidents, rules, and work orders into the graph.',
    badge: <Badge variant="verified">Docling</Badge>,
    cta: 'Open document ingestion',
  },
  {
    to: '/connectors',
    icon: Upload,
    title: 'Connect a source',
    desc: 'Register a source (API or JSON). Syncs pull only new records and accumulate.',
    badge: <Badge variant="verified">Incremental</Badge>,
    cta: 'Open Connectors',
  },
  {
    to: '/workflows/rca',
    icon: Radio,
    title: 'Root cause analysis',
    desc: 'Score hypotheses against evidence, synthesize a causal chain, and preserve uncertainty.',
    badge: <Badge variant="review">Evidence-backed</Badge>,
    cta: 'Open RCA',
  },
  {
    to: '/workflows/compliance',
    icon: ShieldCheck,
    title: 'Compliance',
    desc: 'Review findings by severity and trace each clause back to shared evidence.',
    badge: <Badge variant="linked">Traceable</Badge>,
    cta: 'Open Compliance',
  },
]

export function Workflows() {
  return (
    <>
      <PageHeader
        eyebrow="One workflow at a time"
        title="Workflows"
        description="Choose a focused workflow. Each one keeps its evidence connected to the shared knowledge graph."
      />
      <div className="flex flex-col gap-4">
        {WORKFLOWS.map((wf) => {
          const Icon = wf.icon
          return (
            <Card
              key={wf.to}
              className="flex-row items-center gap-4 py-5 transition-colors hover:border-primary/30"
            >
              <div className="flex flex-1 items-start gap-4 px-6">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-muted-foreground">
                  <Icon className="size-5" />
                </span>
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold">{wf.title}</h2>
                  </div>
                  <p className="mt-0.5 max-w-xl text-sm text-muted-foreground">
                    {wf.desc}
                  </p>
                  <div className="mt-2">{wf.badge}</div>
                </div>
              </div>
              <div className="px-6">
                <Button asChild>
                  <Link to={wf.to}>
                    {wf.cta}
                    <ArrowRight />
                  </Link>
                </Button>
              </div>
            </Card>
          )
        })}
      </div>
    </>
  )
}
