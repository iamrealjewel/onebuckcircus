import { prisma } from "@/lib/prisma";
import { Globe } from "lucide-react";
import AIModelManager from "@/components/admin/AIModelManager";

export default async function AdminAIPage() {
  const models = await prisma.aIModel.findMany({
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="animate-fade-in space-y-12">
      <AIModelManager initialModels={models} />

      <div className="card-glass p-8 bg-[var(--brand-primary)]/5 border border-[var(--brand-primary)]/20">
        <div className="flex items-start gap-4">
          <Globe className="text-[var(--brand-primary)] mt-1" size={24} />
          <div>
            <h4 className="font-black mb-1">Act-Specific Overrides</h4>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              You can assign specific oracles to specific acts in the Acts Management section. 
              If no specific oracle is assigned, the <strong>Global Default</strong> will be used. 
              Inactive oracles will be skipped automatically.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
