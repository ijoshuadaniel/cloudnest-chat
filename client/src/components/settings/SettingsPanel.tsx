import { BrainCircuit, Check, Image, Mic, Music, Pencil, Plus, Trash2, Video } from 'lucide-react';
import { useState } from 'react';
import type { ModelConfig } from '../../types';
import { useAppStore } from '../../stores/appStore';
import { Input } from '../ui/input';
import { Button } from '../ui/button';

type ModelType = 'text-to-text' | 'text-to-image' | 'vision' | 'embeddings' | 'audio' | 'multimodal';

const modelTypeOptions: { value: ModelType; label: string; description: string }[] = [
  { value: 'text-to-text', label: 'Text to text', description: 'Chat and text generation' },
  { value: 'text-to-image', label: 'Text to image', description: 'Image generation from prompts' },
  { value: 'vision', label: 'Vision', description: 'Chat with image inputs' },
  { value: 'embeddings', label: 'Embeddings', description: 'Vector embedding models' },
  { value: 'audio', label: 'Audio', description: 'Audio-capable models' },
  { value: 'multimodal', label: 'Multimodal', description: 'Mixed text, image, audio, or video' }
];

const capabilityIcons = {
  text: BrainCircuit,
  images: Image,
  audio: Music,
  video: Video,
  embeddings: BrainCircuit,
  multimodal: Mic
};

function modelTypeFromModel(model: ModelConfig): ModelType {
  if (model.endpointType === 'image') return 'text-to-image';
  if (model.endpointType === 'vision') return 'vision';
  if (model.endpointType === 'embedding') return 'embeddings';
  if (model.endpointType === 'audio') return 'audio';
  if (model.endpointType === 'multimodal') return 'multimodal';
  return 'text-to-text';
}

export function SettingsPanel({
  models,
  onAddModel,
  onDeleteModel
}: {
  models: ModelConfig[];
  onAddModel: (modelId: string, modelType: ModelType, previousModelId?: string) => Promise<void>;
  onDeleteModel: (modelId: string) => Promise<void>;
}) {
  const { selectedModelId, setSelectedModelId } = useAppStore();
  const [customModelId, setCustomModelId] = useState('');
  const [customModelType, setCustomModelType] = useState<ModelType>('text-to-text');
  const [editingModelId, setEditingModelId] = useState<string>();
  const [saving, setSaving] = useState(false);
  const [deletingModelId, setDeletingModelId] = useState<string>();
  const selectedModel = models.find((model) => model.modelId === selectedModelId);

  const submitCustomModel = async () => {
    if (!customModelId.trim()) return;
    setSaving(true);
    await onAddModel(customModelId.trim(), customModelType, editingModelId);
    setCustomModelId('');
    setCustomModelType('text-to-text');
    setEditingModelId(undefined);
    setSaving(false);
  };

  const startEditModel = (model: ModelConfig) => {
    setEditingModelId(model.modelId);
    setCustomModelId(model.modelId);
    setCustomModelType(modelTypeFromModel(model));
  };

  const cancelEditModel = () => {
    setEditingModelId(undefined);
    setCustomModelId('');
    setCustomModelType('text-to-text');
  };

  const deleteModel = async (modelId: string) => {
    setDeletingModelId(modelId);
    await onDeleteModel(modelId);
    setDeletingModelId(undefined);
  };

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10">
      <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold tracking-tight">Settings</h2>
          <p className="mt-1 text-sm text-foreground/55">Manage model routing, capabilities, and interface preference.</p>
        </div>
              </div>

      <div className="space-y-6">
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5">
            <h3 className="text-base font-semibold">Models</h3>
            <p className="mt-1.5 text-sm text-foreground/55">Select from the header while chatting. Add new NVIDIA NIM model IDs here.</p>
          </div>

          <div className="space-y-4">
            {editingModelId && (
              <div className="flex items-center justify-between rounded-lg bg-muted px-4 py-2.5 text-sm text-foreground/70">
                <span>Editing model</span>
                <button type="button" onClick={cancelEditModel} className="rounded-md px-2.5 py-1 hover:bg-foreground/10">
                  Cancel
                </button>
              </div>
            )}

            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">{editingModelId ? 'Model ID' : 'Add model ID'}</span>
              <Input
                value={customModelId}
                onChange={(event) => setCustomModelId(event.target.value)}
                placeholder="provider/model-name"
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void submitCustomModel();
                }}
              />
            </label>

            <label className="block space-y-2">
              <span className="text-xs font-medium uppercase tracking-wide text-foreground/50">Model type</span>
              <select
                value={customModelType}
                onChange={(event) => setCustomModelType(event.target.value as ModelType)}
                className="h-11 w-full rounded-lg border border-border bg-white/55 px-3.5 text-sm text-foreground outline-none transition focus:border-primary dark:bg-white/5"
              >
                {modelTypeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label} - {option.description}
                  </option>
                ))}
              </select>
            </label>

            <div className="flex justify-end pt-2">
              <Button type="button" disabled={saving} onClick={submitCustomModel} className="h-10 px-4">
                <Plus size={16} />
                {editingModelId ? 'Save' : 'Add'}
              </Button>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-border/60">
            <span className="mb-3 block text-xs font-medium uppercase tracking-wide text-foreground/50">Configured models</span>
            <div className="space-y-3">
              {models.map((model) => (
                <div
                  key={model.modelId}
                  className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition ${model.modelId === selectedModelId ? 'border-foreground bg-foreground text-background dark:bg-white dark:text-slate-950' : 'border-border hover:bg-foreground/5'}`}
                >
                  <button type="button" onClick={() => setSelectedModelId(model.modelId)} className="min-w-0 flex-1 text-left">
                    <span className="block truncate text-sm font-medium">{model.label}</span>
                    <span className="block truncate text-xs opacity-65">{model.modelId}</span>
                    <span className="mt-1.5 inline-flex rounded-full border border-border px-2 py-0.5 text-[11px] capitalize opacity-70">
                      {model.endpointType === 'image' ? 'text to image' : model.endpointType}
                    </span>
                  </button>
                  {model.modelId === selectedModelId && <Check size={16} className="mt-0.5 shrink-0" />}
                  <button
                    type="button"
                    title="Edit model"
                    onClick={() => startEditModel(model)}
                    className="rounded-md p-1.5 opacity-70 transition hover:bg-foreground/10"
                  >
                    <Pencil size={15} />
                  </button>
                  <button
                    type="button"
                    title="Delete model"
                    disabled={deletingModelId === model.modelId}
                    onClick={() => void deleteModel(model.modelId)}
                    className="rounded-md p-1.5 opacity-70 transition hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-40"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {selectedModel && (
          <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <h3 className="text-base font-semibold">Selected model</h3>
                <div className="mt-2.5 truncate text-sm font-medium">{selectedModel.label}</div>
                <div className="truncate text-xs text-foreground/55">{selectedModel.modelId}</div>
              </div>
              <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-xs text-accent">
                <Check size={13} />
                Server key from env
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2.5">
              {selectedModel.capabilities.map((capability) => {
                const Icon = capabilityIcons[capability] || BrainCircuit;
                return (
                  <span key={capability} className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs">
                    <Icon size={13} />
                    {capability}
                  </span>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
