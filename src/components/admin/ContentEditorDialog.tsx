import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import DateTimePicker from '@/components/ui/datetime-picker';
import {
  ApiError,
  TYPE_LABELS,
  createContent,
  getContent,
  toPlonePath,
  updateContent,
  type PloneContentItem,
} from '@/services/ploneContentService';
import { Loader2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type ContentEditorDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mode: 'create' | 'edit';
  type: string;
  parentPath: string;
  item: PloneContentItem | null;
  onSaved: () => void | Promise<void>;
};

const toIsoOrEmpty = (value?: string | null): string => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
};

const ContentEditorDialog: React.FC<ContentEditorDialogProps> = ({
  open,
  onOpenChange,
  mode,
  type,
  parentPath,
  item,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [text, setText] = useState('');
  const [remoteUrl, setRemoteUrl] = useState('');
  const [subjects, setSubjects] = useState('');
  const [effective, setEffective] = useState('');
  const [expires, setExpires] = useState('');
  const [excludeFromNav, setExcludeFromNav] = useState(false);
  const [shortId, setShortId] = useState('');

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      if (mode === 'create') {
        setTitle('');
        setDescription('');
        setText('');
        setRemoteUrl('');
        setSubjects('');
        setEffective('');
        setExpires('');
        setExcludeFromNav(false);
        setShortId('');
        return;
      }

      if (!item) return;
      setLoading(true);
      try {
        const full = await getContent(toPlonePath(item['@id']));
        setTitle(full.title || '');
        setDescription(full.description || '');
        const rawText =
          typeof full.text === 'object' && full.text?.data
            ? String(full.text.data)
            : typeof full.text === 'string'
              ? full.text
              : '';
        setText(rawText);
        setRemoteUrl(full.remoteUrl || '');
        setSubjects((full.subjects || []).join(', '));
        setEffective(toIsoOrEmpty(full.effective));
        setExpires(toIsoOrEmpty(full.expires));
        setExcludeFromNav(Boolean(full.exclude_from_nav));
        setShortId(full.id || '');
      } catch (err) {
        toast.error(err instanceof ApiError ? err.message : 'Falha ao carregar item.');
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [open, mode, item]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error('Informe o título.');
      return;
    }

    setSaving(true);
    try {
      const subjectsList = subjects
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: Record<string, unknown> = {
        title: title.trim(),
        description: description.trim() || undefined,
        subjects: subjectsList,
        effective: effective || null,
        expires: expires || null,
        exclude_from_nav: excludeFromNav,
      };

      if (type === 'Link' || (mode === 'edit' && item?.['@type'] === 'Link')) {
        payload.remoteUrl = remoteUrl.trim();
      }

      if (
        type === 'Document' ||
        type === 'Folder' ||
        (mode === 'edit' &&
          (item?.['@type'] === 'Document' || item?.['@type'] === 'Folder'))
      ) {
        if (text.trim()) {
          payload.text = {
            'content-type': 'text/html',
            data: text,
            encoding: 'utf8',
          };
        }
      }

      if (mode === 'create') {
        await createContent(parentPath, {
          '@type': type,
          ...(shortId.trim() ? { id: shortId.trim() } : {}),
          ...payload,
        } as Parameters<typeof createContent>[1]);
        toast.success('Item criado.');
      } else if (item) {
        const updates = { ...payload };
        if (shortId.trim() && shortId.trim() !== item.id) {
          updates.id = shortId.trim();
        }
        await updateContent(toPlonePath(item['@id']), updates);
        toast.success('Item atualizado.');
      }

      await onSaved();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  const typeLabel = TYPE_LABELS[type] || type;
  const dialogTitle =
    mode === 'create' ? `Novo: ${typeLabel}` : `Editar: ${item?.title || typeLabel}`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{dialogTitle}</DialogTitle>
          <DialogDescription>
            Metadados alinhados às abas do Ufac (padrão, datas, tags e configurações).
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando…
          </div>
        ) : (
          <Tabs defaultValue="padrao" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="padrao">Padrão</TabsTrigger>
              <TabsTrigger value="datas">Datas</TabsTrigger>
              <TabsTrigger value="tags">Tags</TabsTrigger>
              <TabsTrigger value="config">Config</TabsTrigger>
            </TabsList>

            <TabsContent value="padrao" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ce-title">
                  Título <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="ce-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  autoFocus
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ce-desc">Descrição</Label>
                <Textarea
                  id="ce-desc"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
                <p className="text-xs text-slate-500">
                  Usada em listagens e resultados de busca.
                </p>
              </div>
              {(type === 'Link' || item?.['@type'] === 'Link') && (
                <div className="space-y-2">
                  <Label htmlFor="ce-url">URL remota</Label>
                  <Input
                    id="ce-url"
                    value={remoteUrl}
                    onChange={(e) => setRemoteUrl(e.target.value)}
                    placeholder="https://..."
                  />
                </div>
              )}
              {(type === 'Document' ||
                type === 'Folder' ||
                item?.['@type'] === 'Document' ||
                item?.['@type'] === 'Folder') && (
                <div className="space-y-2">
                  <Label htmlFor="ce-text">Texto (HTML)</Label>
                  <Textarea
                    id="ce-text"
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              )}
            </TabsContent>

            <TabsContent value="datas" className="mt-4 space-y-4">
              <DateTimePicker
                label="Data de publicação"
                value={effective}
                onChange={setEffective}
                helperText="Se futura, o conteúdo não aparece em listagens até esta data."
              />
              <DateTimePicker
                label="Data de expiração"
                value={expires}
                onChange={setExpires}
              />
            </TabsContent>

            <TabsContent value="tags" className="mt-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ce-subjects">Tags</Label>
                <Input
                  id="ce-subjects"
                  value={subjects}
                  onChange={(e) => setSubjects(e.target.value)}
                  placeholder="edital, monitoria, 2026"
                />
                <p className="text-xs text-slate-500">Separe as tags por vírgula.</p>
              </div>
            </TabsContent>

            <TabsContent value="config" className="mt-4 space-y-4">
              <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <div>
                  <Label htmlFor="ce-nav">Excluir da navegação</Label>
                  <p className="text-xs text-slate-500">
                    Não aparece na árvore de navegação do site.
                  </p>
                </div>
                <Switch
                  id="ce-nav"
                  checked={excludeFromNav}
                  onCheckedChange={setExcludeFromNav}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ce-id">Nome curto (id / URL)</Label>
                <Input
                  id="ce-id"
                  value={shortId}
                  onChange={(e) => setShortId(e.target.value)}
                  placeholder="opcional-ao-criar"
                />
              </div>
            </TabsContent>
          </Tabs>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancelar
          </Button>
          <Button className="bg-ufac-blue" onClick={handleSave} disabled={saving || loading}>
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando…
              </>
            ) : (
              'Salvar'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ContentEditorDialog;
