import React from 'react';
import type { RichItem } from '../../../api/linhAiApi';
import './RichCards.css';

interface Props {
  items: RichItem[];
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Badge({ text, color }: { text?: string; color?: string }) {
  if (!text) return null;
  return (
    <span className={`rich-card__badge ${color ? `rich-card__badge--${color}` : ''}`}>
      {text}
    </span>
  );
}

function MetaList({ meta }: { meta?: Record<string, string | number> }) {
  if (!meta) return null;
  const entries = Object.entries(meta).filter(([, v]) => v !== '' && v !== undefined);
  if (entries.length === 0) return null;
  return (
    <div className="rich-card__meta">
      {entries.map(([k, v]) => (
        <span key={k} className="rich-card__meta-item">
          <span className="rich-card__meta-label">{k}:&nbsp;</span>
          <span className="rich-card__meta-value">{v}</span>
        </span>
      ))}
    </div>
  );
}

function TemplateCard({ item }: { item: RichItem }) {
  return (
    <div className="rich-card rich-card--template">
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} className="rich-card__thumbnail" />
      ) : (
        <div className="rich-card__thumbnail-placeholder">💍</div>
      )}
      <div className="rich-card__body">
        <div className="rich-card__header">
          <span className="rich-card__title">{item.title}</span>
          <Badge text={item.badge} color={item.badgeColor} />
        </div>
        {item.subtitle && <div className="rich-card__subtitle">{item.subtitle}</div>}
        <MetaList meta={item.meta} />
        {item.actionLabel && (
          <a href={item.actionUrl || '#'} className="rich-card__action" onClick={(e) => e.stopPropagation()}>
            {item.actionLabel}
          </a>
        )}
      </div>
    </div>
  );
}

function MyCardCard({ item }: { item: RichItem }) {
  return (
    <div className="rich-card rich-card--my-card">
      {/* col 1: thumbnail */}
      {item.imageUrl ? (
        <img src={item.imageUrl} alt={item.title} className="rich-card__card-thumb" />
      ) : (
        <div className="rich-card__card-thumb">💌</div>
      )}

      {/* col 2: content */}
      <div className="rich-card__card-content">
        <div className="rich-card__header">
          <span className="rich-card__title">{item.title || 'Thiệp chưa đặt tên'}</span>
          <Badge text={item.badge} color={item.badgeColor} />
        </div>
        {item.subtitle && <div className="rich-card__list-sub">{item.subtitle}</div>}
        {item.meta && (
          <div className="rich-card__card-meta">
            {Object.entries(item.meta).map(([k, v]) => (
              <span key={k} className="rich-card__card-stat">
                {k}: <strong>{v}</strong>
              </span>
            ))}
          </div>
        )}
        
        {/* action button moved below content to save horizontal space */}
        {item.actionLabel && (
          <div style={{ marginTop: '6px' }}>
            <a href={item.actionUrl || '#'} className="rich-card__action">
              {item.actionLabel}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

function ListCard({ item }: { item: RichItem }) {
  return (
    <div className="rich-card rich-card--list">
      <div className="rich-card__avatar">{getInitials(item.title)}</div>
      <div className="rich-card__list-content">
        <div className="rich-card__list-title">{item.title}</div>
        {item.subtitle && <div className="rich-card__list-sub">{item.subtitle}</div>}
      </div>
      <div className="rich-card__list-right">
        <Badge text={item.badge} color={item.badgeColor} />
        {item.meta && Object.entries(item.meta).slice(0, 1).map(([k, v]) => (
          <span key={k} className="rich-card__card-stat">{k}: <strong>{v}</strong></span>
        ))}
      </div>
    </div>
  );
}

export function RichCards({ items }: Props) {
  if (!items || items.length === 0) return null;

  const type = items[0].type;
  const isRowLayout = type === 'template';
  const label =
    type === 'template' ? 'Mẫu thiệp gợi ý' :
    type === 'my-card'  ? 'Thiệp của bạn' :
    type === 'rsvp'     ? 'Danh sách RSVP' :
    type === 'wish'     ? 'Lời chúc từ khách' : '';

  return (
    <div style={{ marginTop: 4 }}>
      {label && <div className="rich-cards__label">{label}</div>}
      <div className={`rich-cards ${isRowLayout ? 'rich-cards--row' : ''}`}>
        {items.map((item) => {
          if (item.type === 'template')  return <TemplateCard key={item.id} item={item} />;
          if (item.type === 'my-card')   return <MyCardCard key={item.id} item={item} />;
          if (item.type === 'rsvp')      return <ListCard key={item.id} item={item} />;
          if (item.type === 'wish')      return <ListCard key={item.id} item={item} />;
          return null;
        })}
      </div>
    </div>
  );
}
