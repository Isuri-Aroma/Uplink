import { Pencil, Trash2 } from 'lucide-react';
import Badge from '../../components/ui/Badge';
import { dataCap, lkr } from '../../utils/format';

export const TECH_TONE = { Fibre: 'primary', VDSL: 'off', '4G LTE': 'accent', '5G': 'accent' };

// 1-5 bars from download speed
const level = (down) => (down >= 500 ? 5 : down >= 200 ? 4 : down >= 80 ? 3 : down >= 30 ? 2 : 1);

export default function PlanCard({ plan, canEdit, onOpen, onEdit, onDelete }) {
  const bars = level(plan.downMbps);

  return (
    <article
      onClick={() => onOpen(plan)}
      className={`card flex cursor-pointer flex-col gap-4 p-5 transition-colors hover:border-primary ${plan.isActive ? '' : 'opacity-60'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-extrabold tracking-tight">{plan.name}</h3>
          {plan.description && <p className="truncate text-xs text-muted">{plan.description}</p>}
        </div>
        <Badge tone={TECH_TONE[plan.technology]}>{plan.technology}</Badge>
      </div>

      <div className="flex items-end justify-between gap-4">
        <p className="flex items-baseline gap-1.5">
          <span className="font-mono text-4xl font-bold leading-none tracking-tighter">{plan.downMbps}</span>
          <span className="text-xs text-muted">Mbps down · {plan.upMbps} up</span>
        </p>
        <div className="flex h-6 items-end gap-[3px]" aria-label={`Speed level ${bars} of 5`}>
          {[1, 2, 3, 4, 5].map((i) => (
            <span key={i} className={`w-1.5 rounded-sm ${i <= bars ? 'bg-primary' : 'bg-line'}`} style={{ height: `${30 + i * 14}%` }} />
          ))}
        </div>
      </div>

      <div className="flex justify-between border-t border-dashed border-line pt-3 text-xs text-muted">
        <span>{plan.dataCapGB ? `${dataCap(plan.dataCapGB)} / month` : 'Unlimited data'}</span>
        <span>{plan.subscriberCount} subscribers</span>
      </div>

      <div className="flex items-center justify-between gap-2">
        <p className="text-lg font-extrabold tabular-nums">
          {lkr(plan.monthlyFeeLKR)} <span className="text-xs font-semibold text-muted">/ month</span>
        </p>
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Badge tone={plan.isActive ? 'ok' : 'off'} dot>{plan.isActive ? 'On sale' : 'Inactive'}</Badge>
          {canEdit && (
            <>
              <button className="rounded-lg p-2 text-muted hover:bg-primary-soft hover:text-primary" onClick={() => onEdit(plan)} aria-label={`Edit ${plan.name}`}>
                <Pencil size={15} />
              </button>
              <button className="rounded-lg p-2 text-muted hover:bg-bad-soft hover:text-bad" onClick={() => onDelete(plan)} aria-label={`Delete ${plan.name}`}>
                <Trash2 size={15} />
              </button>
            </>
          )}
        </div>
      </div>
    </article>
  );
}
