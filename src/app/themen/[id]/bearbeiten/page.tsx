import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { updateTopic } from "@/lib/actions/topics";
import TopicForm from "@/components/TopicForm";

export const dynamic = "force-dynamic";

export default async function EditTopicPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const topic = await prisma.topic.findUnique({ where: { id } });

  if (!topic) {
    notFound();
  }

  return (
    <TopicForm
      action={updateTopic.bind(null, topic.id)}
      defaultValues={{
        name: topic.name,
        url: topic.url,
        category: topic.category,
      }}
      heading="Suchthema bearbeiten"
      subheading="Änderungen gelten ab dem nächsten täglichen Durchlauf."
      submitLabel="Änderungen speichern"
      submitPendingLabel="Speichere…"
    />
  );
}
