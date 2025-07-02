import {Duration} from 'luxon';

const labels: Record<string, Record<string, [string, string]>> = {
    en: {
        year: ['year', 'years'],
        month: ['month', 'months'],
        day: ['day', 'days'],
    },
    fr: {
        year: ['an', 'ans'],
        month: ['mois', 'mois'],
        day: ['jour', 'jours'],
    },
    es: {
        year: ['año', 'años'],
        month: ['mes', 'meses'],
        day: ['día', 'días'],
    },
    de: {
        year: ['Jahr', 'Jahre'],
        month: ['Monat', 'Monate'],
        day: ['Tag', 'Tage'],
    },
    it: {
        year: ['anno', 'anni'],
        month: ['mese', 'mesi'],
        day: ['giorno', 'giorni'],
    },
};

export function formatYMDDurationHuman(iso: string, locale: string = 'en'): string {
    const dur = Duration.fromISO(iso);
    const nf = new Intl.NumberFormat(locale);

  type Unit = 'years' | 'months' | 'days';
  const units: Array<[Unit, keyof typeof labels['en']]> = [
      ['years', 'year'],
      ['months', 'month'],
      ['days', 'day'],
  ];

  const loc = labels[locale] || labels.en;

  return units.
      map(([key, labelKey]) => {
          const val = dur[key];
          if (!val) {
              return null;
          }

          const [singular, plural] = loc[labelKey];
          const label = val === 1 ? singular : plural;
          return `${nf.format(val)} ${label}`;
      }).
      filter(Boolean).
      join(' ');
}
