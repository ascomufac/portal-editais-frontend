import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ApiError,
  getSharing,
  updateSharing,
  type PloneSharingEntry,
  type PloneSharingResponse,
} from '@/services/ploneContentService';
import { Loader2, Search } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';

type SharingDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  path: string;
};

const SharingDialog: React.FC<SharingDialogProps> = ({ open, onOpenChange, path }) => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<PloneSharingResponse | null>(null);
  const [entries, setEntries] = useState<PloneSharingEntry[]>([]);
  const [inherit, setInherit] = useState(true);
  const [search, setSearch] = useState('');

  const load = async (term?: string) => {
    setLoading(true);
    try {
      const result = term
        ? await updateSharing(path, { search_term: term })
        : await getSharing(path);
      setData(result);
      setEntries(result.entries || []);
      setInherit(result.inherit !== false);
    } catch (err) {
      toast.error(
        err instanceof ApiError ? err.message : 'Falha ao carregar compartilhamento.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      setSearch('');
      load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, path]);

  const roles = data?.available_roles || [];

  const toggleRole = (entryId: string, roleId: string, checked: boolean) => {
    setEntries((prev) =>
      prev.map((entry) => {
        if (entry.id !== entryId) return entry;
        return {
          ...entry,
          roles: {
            ...(entry.roles || {}),
            [roleId]: checked,
          },
        };
      })
    );
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSharing(path, {
        inherit,
        entries: entries.map((e) => ({
          id: e.id,
          type: e.type,
          roles: e.roles,
        })),
      });
      toast.success('Compartilhamento atualizado.');
      onOpenChange(false);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : 'Falha ao salvar.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>Compartilhamento</DialogTitle>
          <DialogDescription>
            Defina papéis de usuários e grupos neste contexto (API @sharing do Ufac).
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <Input
              className="pl-9"
              placeholder="Buscar usuário ou grupo…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') load(search.trim());
              }}
            />
          </div>
          <Button variant="outline" onClick={() => load(search.trim())} disabled={loading}>
            Buscar
          </Button>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
          <div>
            <Label htmlFor="share-inherit">Herdar permissões do pai</Label>
            <p className="text-xs text-slate-500">Equivalente ao checkbox do Ufac clássico.</p>
          </div>
          <Switch id="share-inherit" checked={inherit} onCheckedChange={setInherit} />
        </div>

        {loading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
            Carregando…
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  {roles.map((role) => (
                    <TableHead key={role.id} className="text-center text-xs">
                      {role.title}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={roles.length + 1}
                      className="py-8 text-center text-slate-500"
                    >
                      Nenhum usuário/grupo listado. Busque pelo nome.
                    </TableCell>
                  </TableRow>
                ) : (
                  entries.map((entry) => (
                    <TableRow key={`${entry.type}-${entry.id}`}>
                      <TableCell>
                        <div className="font-medium">{entry.title || entry.id}</div>
                        <div className="text-xs text-slate-500">
                          {entry.type} · {entry.id}
                        </div>
                      </TableCell>
                      {roles.map((role) => {
                        const value = entry.roles?.[role.id];
                        const checked = value === true || value === '1';
                        const disabled =
                          Array.isArray(entry.disabled) &&
                          entry.disabled.includes(role.id);
                        return (
                          <TableCell key={role.id} className="text-center">
                            <Checkbox
                              checked={checked}
                              disabled={Boolean(disabled)}
                              onCheckedChange={(v) =>
                                toggleRole(entry.id, role.id, v === true)
                              }
                            />
                          </TableCell>
                        );
                      })}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
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

export default SharingDialog;
