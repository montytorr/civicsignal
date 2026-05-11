import { getPollById, getVoteCount } from '@/lib/queries'
import { ResolvedPage } from '@/components/resolved-page'
import { redirect, notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
}

export default async function Page({ params }: Props) {
  const { id } = await params
  const [rawPoll, count] = await Promise.all([getPollById(id), getVoteCount(id)])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const dbPoll = rawPoll as any

  if (!dbPoll) notFound()
  if (dbPoll.status !== 'resolved') redirect(`/polls/${id}`)

  const options: string[] = Array.isArray(dbPoll.options)
    ? (dbPoll.options as string[])
    : JSON.parse(dbPoll.options as string)

  return (
    <ResolvedPage
      id={dbPoll.id}
      question={dbPoll.question}
      topicSlug={dbPoll.topics?.slug ?? ''}
      region={dbPoll.region}
      resolvedAt={dbPoll.resolved_at ?? dbPoll.resolves_at}
      outcome={dbPoll.outcome ?? ''}
      options={options}
      participants={count}
      source={dbPoll.source_of_truth}
      sourceUrl={dbPoll.resolution_source_url ?? null}
      notes={dbPoll.resolution_notes ?? null}
      commitmentHash={dbPoll.commitment_hash ?? null}
      topicLabel={dbPoll.topics?.label ?? null}
    />
  )
}
