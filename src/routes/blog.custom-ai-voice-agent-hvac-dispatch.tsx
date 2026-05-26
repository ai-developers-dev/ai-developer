import { createFileRoute, Link } from '@tanstack/react-router'
import {
  BlogPost,
  H2,
  P,
  UL,
  Quote,
  type BlogPostMeta,
} from '@/components/blog/blog-post'
import { pageSeo } from '@/lib/seo'

const meta: BlogPostMeta = {
  path: '/blog/custom-ai-voice-agent-hvac-dispatch',
  category: 'Voice AI',
  title: 'How a Custom AI Voice Agent Books HVAC Dispatch 24/7',
  excerpt:
    "What a working voice AI dispatcher actually does for an HVAC shop — call answering, intake, scheduling, and emergency triage. Plus the tradeoffs nobody talks about.",
  date: 'May 8, 2026',
  isoDate: '2026-05-08',
  author: 'Doug Allen',
}

export const Route = createFileRoute(
  '/blog/custom-ai-voice-agent-hvac-dispatch',
)({
  component: PostPage,
  head: () =>
    pageSeo({
      title: 'Custom AI Voice Agent for HVAC Dispatch — AI Developer',
      description: meta.excerpt,
      path: meta.path,
    }),
})

function PostPage() {
  return (
    <BlogPost meta={meta}>
      <P>
        Most HVAC shops lose 15-25% of inbound calls. Not because nobody
        answers — the office manager is doing her best — but because the
        phone rings during a tune-up, the message gets missed, the customer
        finds someone else. By the time anyone listens to voicemail, the job
        is gone.
      </P>
      <P>
        AI voice agents have crossed the threshold where they actually solve
        this. They answer in two rings, talk like a person, book the
        appointment, and dump the details into your CRM. We've been building
        them for home service shops for the last year — here's what works,
        what doesn't, and what it actually takes to deploy one.
      </P>

      <H2>What a working dispatch AI actually does</H2>
      <P>
        The version we've been deploying handles five categories of inbound
        call automatically:
      </P>
      <UL>
        <li>
          <strong>New service requests</strong> — collects address,
          equipment, symptoms, urgency. Books a same-week slot from the live
          schedule.
        </li>
        <li>
          <strong>Maintenance scheduling</strong> — looks up the existing
          contract, finds the next available slot in the customer's
          preferred window.
        </li>
        <li>
          <strong>Emergency triage</strong> — detects "no heat," "no AC,"
          "gas smell," and routes to a real on-call tech immediately
          instead of trying to handle it.
        </li>
        <li>
          <strong>Status inquiries</strong> — "where's my tech?"
          questions get answered from the dispatch system without
          escalating.
        </li>
        <li>
          <strong>Quote callbacks</strong> — leaves a structured handoff
          for your estimator with everything needed to call back prepared.
        </li>
      </UL>

      <H2>What it sounds like</H2>
      <P>
        Modern voice models (we use the ElevenLabs and OpenAI realtime
        stacks) sound human. Customers regularly thank the AI by name at the
        end of the call and have no idea they were talking to software. The
        speed is the giveaway — it answers in under two seconds and never
        sounds rushed.
      </P>
      <P>
        The one place we tell shops to be cautious: do not lie about it. If
        a caller asks "am I talking to a real person?", the agent should be
        honest. The trust hit from being caught lying is much worse than the
        novelty of being told upfront.
      </P>

      <H2>What it costs to run</H2>
      <P>
        Voice AI runs on a per-minute pricing model. Typical breakdown:
      </P>
      <UL>
        <li>
          <strong>Telephony (Twilio):</strong> ~$0.014/minute
        </li>
        <li>
          <strong>Speech-to-text (Deepgram / Whisper):</strong> ~$0.005/min
        </li>
        <li>
          <strong>LLM (GPT-4o / Claude):</strong> ~$0.02-0.04/min
        </li>
        <li>
          <strong>Text-to-speech (ElevenLabs):</strong> ~$0.05/min
        </li>
      </UL>
      <P>
        Call it $0.10/minute all-in. A 5-minute booking call costs $0.50.
        If you take 30 calls a day, that's ~$15/day in raw API cost. The
        custom build itself runs $8,000-15,000 depending on integrations.
      </P>

      <H2>The tradeoffs nobody talks about</H2>
      <P>Two things to know before you commit:</P>
      <P>
        <strong>You need a clean CRM first.</strong> The AI has to read from
        and write to your job records. If your data lives across spreadsheets
        and group texts, the AI can't dispatch from it. We almost always
        recommend a{' '}
        <Link
          to="/services/custom-crm/hvac"
          className="text-brand-primary underline"
        >
          custom CRM build
        </Link>{' '}
        as the foundation before bolting on voice.
      </P>
      <P>
        <strong>Some calls still need a person.</strong> Complex re-routing,
        unusual financing questions, irate customers — AI is great at the
        common cases and ordinary at the edge cases. The shops that win
        treat AI as the front line that handles 70-80% cleanly, and route
        the rest to a human.
      </P>

      <Quote>
        The best voice deployments aren't trying to replace the office.
        They're letting the office stop being a switchboard so they can
        actually do the work that grows the business.
      </Quote>

      <H2>What it looks like deployed</H2>
      <P>
        For a 6-truck HVAC shop in the Midwest, we deployed a voice agent
        that:
      </P>
      <UL>
        <li>Answers every after-hours call within 2 seconds</li>
        <li>Books straightforward service in under 90 seconds</li>
        <li>Triages no-heat emergencies to on-call within 30 seconds</li>
        <li>Cuts missed-call lost revenue by an estimated 40%</li>
        <li>Saves the office manager ~20 hours/week of phone time</li>
      </UL>
      <P>
        If you're running an HVAC shop and your office is drowning in phone
        traffic, this is the highest-leverage AI deployment available right
        now. See our{' '}
        <Link to="/services/voice-ai" className="text-brand-primary underline">
          Voice AI Agents
        </Link>{' '}
        page for the full build, or read more about{' '}
        <Link
          to="/services/custom-crm/hvac"
          className="text-brand-primary underline"
        >
          custom CRMs for HVAC contractors
        </Link>{' '}
        that make voice deployment possible.
      </P>
    </BlogPost>
  )
}
