import { Save, UserRound } from 'lucide-react';
import { useState } from 'react';
import { toDateTimeLocalValue } from '../utils/date';

const initialForm = {
  nomeAtendido: '',
  descricao: '',
  atendimentoEm: toDateTimeLocalValue()
};

export function AttendanceForm({ onAdd }) {
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
    setError('');
    setSaved(false);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!form.nomeAtendido.trim() || !form.descricao.trim()) {
      setError('Informe nome e descricao do atendimento.');
      return;
    }

    try {
      setSaving(true);
      await onAdd({
        nomeAtendido: form.nomeAtendido,
        descricao: form.descricao,
        atendimentoEm: new Date(form.atendimentoEm).toISOString()
      });

      setForm({
        nomeAtendido: '',
        descricao: '',
        atendimentoEm: toDateTimeLocalValue()
      });
      setSaved(true);
    } catch (submitError) {
      setError(submitError.message || 'Nao foi possivel salvar o atendimento.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="form-panel" aria-labelledby="form-title">
      <div className="section-title">
        <UserRound size={20} aria-hidden="true" />
        <h2 id="form-title">Novo atendimento</h2>
      </div>

      <form onSubmit={handleSubmit} className="attendance-form">
        <label>
          Nome do atendido
          <input
            type="text"
            value={form.nomeAtendido}
            onChange={(event) => updateField('nomeAtendido', event.target.value)}
            autoComplete="name"
            maxLength={120}
            required
          />
        </label>

        <label>
          Data e hora
          <input
            type="datetime-local"
            value={form.atendimentoEm}
            onChange={(event) => updateField('atendimentoEm', event.target.value)}
            required
          />
        </label>

        <label>
          Descricao
          <textarea
            value={form.descricao}
            onChange={(event) => updateField('descricao', event.target.value)}
            rows={4}
            maxLength={700}
            required
          />
        </label>

        {error ? <p className="form-message error-message">{error}</p> : null}
        {saved ? <p className="form-message success-message">Atendimento salvo localmente.</p> : null}

        <button type="submit" className="primary-button" disabled={saving}>
          <Save size={18} aria-hidden="true" />
          Salvar atendimento
        </button>
      </form>
    </section>
  );
}
