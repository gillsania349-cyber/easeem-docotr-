"use client";
/* eslint-disable */
/* PakMed Prescription Pad — clickable prototype
   Flow: the last-used pad opens → doctor taps any part of the pad to fill it → Preview & send.
   Required: patient name, age, sex, diagnosis. Anything left empty is left off the final prescription.
   The medicine list and dose limits below are a small SAMPLE for the prototype; the live app needs a
   proper medicine database. */

import React, { useState, useEffect, useMemo, useRef } from "react";
import "./rx.css";

/* ================= Formatting helpers ================= */
const UR_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const urDigits = (s) => String(s).replace(/[0-9]/g, (d) => UR_DIGITS[Number(d)]);
const EN_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const UR_MONTHS = ['جنوری', 'فروری', 'مارچ', 'اپریل', 'مئی', 'جون', 'جولائی', 'اگست', 'ستمبر', 'اکتوبر', 'نومبر', 'دسمبر'];
const clean = (s) => (s == null ? '' : String(s).trim());
const fmtDate = (d) => `${d.getDate()} ${EN_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
function fmtTime(d) {
  let h = d.getHours();
  const m = String(d.getMinutes()).padStart(2, '0');
  const ap = h >= 12 ? 'pm' : 'am';
  h = h % 12 || 12;
  return `${h}:${m} ${ap}`;
}
const fmtDateTime = (d) => `${fmtDate(d)}, ${fmtTime(d)}`;
const urDate = (d) => `${urDigits(d.getDate())} ${UR_MONTHS[d.getMonth()]}`;
const uid = () => Math.random().toString(36).slice(2, 9);
function newRxId(d) {
  return `PM-RX-${String(d.getFullYear()).slice(2)}${String(d.getMonth() + 1).padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
}
function addDays(d, n) { const x = new Date(d.getTime()); x.setDate(x.getDate() + n); return x; }
function listText(items) {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
function fmtMg(v) {
  if (v >= 1000) { const g = v / 1000; return `${Number.isInteger(g) ? g : g.toFixed(1)} g`; }
  return `${Math.round(v)} mg`;
}
function maskPhone(p) {
  const d = clean(p).replace(/\D/g, '');
  if (d.length < 7) return clean(p);
  return `${d.slice(0, 4)}-•••${d.slice(-4)}`;
}
function mix(hex, amt) {
  let h = String(hex || '').replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  const n = parseInt(h, 16);
  if (h.length !== 6 || Number.isNaN(n)) return '#eef3f3';
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const f = (c) => Math.round(c + (255 - c) * (1 - amt));
  return `rgb(${f(r)},${f(g)},${f(b)})`;
}
const store = {
  get(k) { try { return window.localStorage.getItem(k); } catch (e) { return null; } },
  set(k, v) { try { window.localStorage.setItem(k, v); } catch (e) { /* storage unavailable */ } },
};
const LAST_PAD_KEY = 'pakmed-rxpad-last-pad';

/* ================= Pads (saved letterhead setups) ================= */
const TEMPLATES = {
  classic: { name: 'Classic', desc: 'Name across the top, clinical notes in a side column' },
  bilingual: { name: 'Bilingual', desc: 'Your name in English and Urdu, medicines in a table', urdu: true },
  modern: { name: 'Modern', desc: 'Doctor and clinic details in a coloured side panel' },
  banner: { name: 'Banner', desc: 'Bold colour band across the top, one clean column' },
  elegant: { name: 'Elegant', desc: 'Framed page with a centred serif letterhead' },
  minimal: { name: 'Minimal', desc: 'Plain and airy, with a single thin rule' },
  hospital: { name: 'Hospital', desc: 'Clinic or hospital name first, boxed sections, medicine table' },
  split: { name: 'Split', desc: 'Coloured name block beside the clinic, notes on the right' },
  compact: { name: 'Compact', desc: 'Slim header and a medicine table, fits long prescriptions' },
  stripe: { name: 'Stripe', desc: 'Colour stripe down the left edge, boxed patient details' },
};
const TEMPLATE_KEYS = Object.keys(TEMPLATES);
const ACCENTS = [['#0F5E63', 'Teal'], ['#1D3D6E', 'Navy'], ['#7A1F2B', 'Maroon'], ['#2F5D34', 'Green'], ['#5A2E6E', 'Plum'], ['#2E3A40', 'Charcoal'], ['#8A4B12', 'Brown'], ['#16627F', 'Ocean']];
const DEGREE_PICKS = ['MBBS', 'BDS', 'FCPS', 'MCPS', 'MRCP (UK)', 'FRCP', 'MRCS', 'FRCS', 'MD', 'MS', 'DCH', 'DGO', 'DMRD', 'Dip. Card', 'MPH', 'CHPE'];

/* Dr. Awais Tahir's details. Phone numbers, PMDC number and timings are placeholders to replace. */
const DOCTOR = {
  name: 'Dr. Awais Tahir', nameUr: 'ڈاکٹر اویس طاہر',
  degrees: ['MBBS', 'FCPS (Orthopaedics)'], qualsUr: 'ایم بی بی ایس، ایف سی پی ایس (آرتھوپیڈکس)',
  title: 'Consultant Orthopaedic Surgeon', titleUr: 'کنسلٹنٹ آرتھوپیڈک سرجن',
  pmdc: '00000-P', signature: 'Awais Tahir',
};
/* The doctor's verified PakMed profile. Name and PMDC number always come from here and can't be changed on a pad:
   one account = one doctor. */
const PROFILE = { name: DOCTOR.name, pmdc: DOCTOR.pmdc, degrees: [...DOCTOR.degrees], nameUr: DOCTOR.nameUr, verified: true };
export function setRxProfile(p) { if (!p) return; if (p.name) PROFILE.name = p.name; if (p.pmdc) PROFILE.pmdc = p.pmdc; if (p.degrees && p.degrees.length) PROFILE.degrees = [...p.degrees]; }
const LIFECARE = { name: 'Lifecare Medical Center', address: 'Rachna Town, Faisalabad', phone: '0300-0000000', timings: 'Mon–Sat · 5:00–9:00 pm' };
const JILANI = { name: 'Jilani Medicare', address: '172 GB, Faisalabad', phone: '041-0000000', timings: 'Mon, Wed, Fri · 2:00–4:00 pm' };

const SAMPLE_PADS = [
  {
    id: 'pad-lifecare', label: 'Lifecare', template: 'classic', accent: '#0F5E63', doctor: { ...DOCTOR },
    clinic: { ...LIFECARE },
    alsoAt: [{ name: `${JILANI.name}, ${JILANI.address}`, timings: JILANI.timings }],
  },
  {
    id: 'pad-jilani', label: 'Jilani Medicare', template: 'modern', accent: '#1D3D6E', doctor: { ...DOCTOR },
    clinic: { ...JILANI },
    alsoAt: [{ name: `${LIFECARE.name}, ${LIFECARE.address}`, timings: LIFECARE.timings }],
  },
  {
    id: 'pad-lifecare-ur', label: 'Lifecare (Urdu)', template: 'bilingual', accent: '#7A1F2B', doctor: { ...DOCTOR },
    clinic: { ...LIFECARE },
    alsoAt: [{ name: `${JILANI.name}, ${JILANI.address}`, timings: JILANI.timings }],
  },
];
const OLD_SAMPLE_PAD_IDS = ['pad-evening', 'pad-opd', 'pad-urdu'];

/* Older saved pads stored qualifications and "also at" as single lines; convert them to lists. */
function normalizePad(p) {
  if (!p) return p;
  const doctor = { ...(p.doctor || {}) };
  if (!Array.isArray(doctor.degrees)) {
    doctor.degrees = clean(doctor.quals) ? doctor.quals.split(/,\s*(?![^()]*\))/).map(clean).filter(Boolean) : [];
  }
  let alsoAt = p.alsoAt;
  if (!Array.isArray(alsoAt)) alsoAt = clean(alsoAt) ? [{ name: clean(alsoAt), timings: '' }] : [];
  alsoAt = alsoAt.map((a) => (typeof a === 'string' ? { name: a, timings: '' } : { name: a.name || '', timings: a.timings || '' }));
  return { ...p, template: TEMPLATES[p.template] ? p.template : 'classic', doctor, clinic: { name: '', address: '', phone: '', timings: '', ...(p.clinic || {}) }, alsoAt };
}
function livePad(pad) {
  const n = normalizePad(pad);
  return { ...n, doctor: { ...n.doctor, name: PROFILE.name, pmdc: PROFILE.pmdc } };
}
const degreesText = (doctor) => (Array.isArray(doctor.degrees) ? doctor.degrees.map(clean).filter(Boolean).join(', ') : clean(doctor.quals));
const alsoAtLines = (pad) => (Array.isArray(pad.alsoAt) ? pad.alsoAt : [])
  .map((a) => [clean(a.name), clean(a.timings)].filter(Boolean).join(' · ')).filter(Boolean);

/* ================= Medicine vocabulary ================= */
const FORMS = {
  Tab: { label: 'Tablet', pre: 'Tab.', unit: ['tablet', 'tablets'], ur: ['گولی', 'گولیاں'], route: 'Oral', doses: ['½', '1', '2'], countable: true },
  Cap: { label: 'Capsule', pre: 'Cap.', unit: ['capsule', 'capsules'], ur: ['کیپسول', 'کیپسول'], route: 'Oral', doses: ['1', '2'], countable: true },
  Syp: { label: 'Syrup', pre: 'Syp.', ml: true, route: 'Oral', doses: ['2.5', '5', '7.5', '10'], pack: '1 bottle' },
  Drops: { label: 'Drops', post: 'drops', unit: ['drop', 'drops'], ur: ['قطرہ', 'قطرے'], route: 'Eye', doses: ['1', '2', '3'], pack: '1 bottle' },
  Inj: { label: 'Injection', pre: 'Inj.', unit: ['injection', 'injections'], ur: ['ٹیکہ', 'ٹیکے'], route: 'IM', doses: ['1'], countable: true },
  Inhaler: { label: 'Inhaler', post: 'inhaler', unit: ['puff', 'puffs'], ur: ['پف', 'پف'], route: 'Inhaled', doses: ['1', '2'], pack: '1 inhaler' },
  Cream: { label: 'Cream', post: 'cream', layer: true, route: 'Topical', doses: [], pack: '1 tube' },
  Sachet: { label: 'Sachet', pre: 'Sachet', unit: ['sachet', 'sachets'], ur: ['ساشے', 'ساشے'], route: 'Oral', doses: ['1', '2'], countable: true },
  Gargle: { label: 'Gargle', ml: true, route: 'Gargle', doses: ['5', '10', '15'], pack: '1 bottle' },
  Supp: { label: 'Suppository', pre: 'Supp.', unit: ['suppository', 'suppositories'], ur: ['سپوزیٹری', 'سپوزیٹری'], route: 'PR', doses: ['1'], countable: true },
  Spray: { label: 'Spray', post: 'spray', unit: ['spray', 'sprays'], ur: ['سپرے', 'سپرے'], route: 'Nasal', doses: ['1', '2'], pack: '1 bottle' },
};
const FORM_KEYS = Object.keys(FORMS);

const ROUTES = [
  { k: 'Oral', en: 'Oral' },
  { k: 'SL', en: 'Sublingual', pre: 'زبان کے نیچے', verb: 'رکھیں' },
  { k: 'IV', en: 'IV', verb: 'لگوائیں' },
  { k: 'IM', en: 'IM', verb: 'لگوائیں' },
  { k: 'SC', en: 'SC', verb: 'لگوائیں' },
  { k: 'Topical', en: 'Topical', pre: 'متاثرہ جگہ پر', verb: 'لگائیں' },
  { k: 'Inhaled', en: 'Inhaled', verb: 'لیں' },
  { k: 'Eye', en: 'Eye', pre: 'آنکھ میں', verb: 'ڈالیں' },
  { k: 'Ear', en: 'Ear', pre: 'کان میں', verb: 'ڈالیں' },
  { k: 'Nasal', en: 'Nasal', pre: 'ناک میں', verb: 'ڈالیں' },
  { k: 'PR', en: 'Rectal', pre: 'مقعد میں', verb: 'رکھیں' },
  { k: 'Gargle', en: 'Gargle' },
];
const ROUTE_MAP = Object.fromEntries(ROUTES.map((r) => [r.k, r]));

const FREQS = [
  { k: 'OD', en: 'Once daily', perDay: 1, ur: 'دن میں ایک بار' },
  { k: 'BD', en: 'Twice daily', perDay: 2, ur: 'دن میں دو بار' },
  { k: 'TDS', en: '3 times daily', perDay: 3, ur: 'دن میں تین بار' },
  { k: 'QID', en: '4 times daily', perDay: 4, ur: 'دن میں چار بار' },
  { k: 'HS', en: 'At bedtime', perDay: 1, ur: 'رات سونے سے پہلے' },
  { k: 'SOS', en: 'When needed', perDay: null, ur: 'ضرورت پڑنے پر' },
  { k: 'Stat', en: 'Once, now', perDay: null, ur: 'فوراً، صرف ایک بار' },
  { k: 'Weekly', en: 'Once a week', perDay: null, ur: 'ہفتے میں ایک بار' },
];
const FREQ_MAP = Object.fromEntries(FREQS.map((f) => [f.k, f]));

const TIMINGS = [
  { k: 'after', en: 'After meals', ur: 'کھانے کے بعد' },
  { k: 'before', en: 'Before meals', ur: 'کھانے سے پہلے' },
  { k: 'with', en: 'With meals', ur: 'کھانے کے ساتھ' },
  { k: 'empty', en: 'Empty stomach', ur: 'خالی پیٹ' },
  { k: 'breakfast', en: '30 min before breakfast', ur: 'ناشتے سے آدھا گھنٹہ پہلے' },
];
const TIMING_MAP = Object.fromEntries(TIMINGS.map((t) => [t.k, t]));

const UR_NUM = { '½': 'آدھی', '1': 'ایک', '1½': 'ڈیڑھ', '2': 'دو', '3': 'تین', '4': 'چار', '5': 'پانچ' };
const UR_COUNT = { '2': 'دو', '3': 'تین', '4': 'چار', '6': 'چھ' };
const SPOONS = { '2.5': 'آدھا چمچ', '5': 'ایک چمچ', '7.5': 'ڈیڑھ چمچ', '10': 'دو چمچ', '15': 'تین چمچ', '20': 'چار چمچ' };

/* Sample medicine list (brand → generic). The doctor can always type any name. */
const DRUGS = [
  { name: 'Panadol', generic: 'Paracetamol', form: 'Tab', strengths: ['500 mg'] },
  { name: 'Paracetamol', generic: '', form: 'Tab', strengths: ['500 mg'] },
  { name: 'Calpol', generic: 'Paracetamol', form: 'Syp', strengths: ['120 mg/5 ml'] },
  { name: 'Brufen', generic: 'Ibuprofen', form: 'Tab', strengths: ['200 mg', '400 mg'] },
  { name: 'Brufen', generic: 'Ibuprofen', form: 'Syp', strengths: ['100 mg/5 ml'] },
  { name: 'Augmentin', generic: 'Amoxicillin + Clavulanic acid', form: 'Tab', strengths: ['625 mg', '1 g'] },
  { name: 'Augmentin', generic: 'Amoxicillin + Clavulanic acid', form: 'Syp', strengths: ['156 mg/5 ml', '312 mg/5 ml'] },
  { name: 'Amoxil', generic: 'Amoxicillin', form: 'Cap', strengths: ['250 mg', '500 mg'] },
  { name: 'Risek', generic: 'Omeprazole', form: 'Cap', strengths: ['20 mg', '40 mg'] },
  { name: 'Azomax', generic: 'Azithromycin', form: 'Tab', strengths: ['250 mg', '500 mg'] },
  { name: 'Ciprofloxacin', generic: '', form: 'Tab', strengths: ['250 mg', '500 mg'] },
  { name: 'Flagyl', generic: 'Metronidazole', form: 'Tab', strengths: ['200 mg', '400 mg'] },
  { name: 'Ponstan', generic: 'Mefenamic acid', form: 'Tab', strengths: ['250 mg', '500 mg'] },
  { name: 'Disprin', generic: 'Aspirin', form: 'Tab', strengths: ['300 mg'] },
  { name: 'Diclofenac', generic: '', form: 'Tab', strengths: ['50 mg'] },
  { name: 'Glucophage', generic: 'Metformin', form: 'Tab', strengths: ['500 mg', '850 mg', '1 g'] },
  { name: 'Zyrtec', generic: 'Cetirizine', form: 'Tab', strengths: ['10 mg'] },
  { name: 'Doxycycline', generic: '', form: 'Cap', strengths: ['100 mg'] },
  { name: 'Septran DS', generic: 'Co-trimoxazole', form: 'Tab', strengths: ['960 mg'] },
  { name: 'Ventolin', generic: 'Salbutamol', form: 'Inhaler', strengths: ['100 mcg/puff'] },
  { name: 'Betadine Gargle', generic: 'Povidone-iodine', form: 'Gargle', strengths: ['1%'] },
  { name: 'ORS', generic: 'Oral rehydration salts', form: 'Sachet', strengths: [''] },
];

/* Which active ingredient a written medicine contains (order matters: combinations first). */
const KEY_ALIASES = [
  ['co-amoxiclav', ['augmentin', 'co-amoxiclav', 'coamoxiclav', 'amoxiclav', 'clavulan']],
  ['co-trimoxazole', ['co-trimoxazole', 'cotrimoxazole', 'septran', 'sulfamethoxazole']],
  ['paracetamol', ['paracetamol', 'panadol', 'calpol', 'acetaminophen']],
  ['ibuprofen', ['ibuprofen', 'brufen']],
  ['amoxicillin', ['amoxicillin', 'amoxil']],
  ['omeprazole', ['omeprazole', 'risek']],
  ['azithromycin', ['azithromycin', 'azomax']],
  ['ciprofloxacin', ['ciprofloxacin', 'cipro']],
  ['metronidazole', ['metronidazole', 'flagyl']],
  ['mefenamic', ['mefenamic', 'ponstan']],
  ['aspirin', ['aspirin', 'disprin']],
  ['diclofenac', ['diclofenac']],
  ['metformin', ['metformin', 'glucophage']],
  ['cetirizine', ['cetirizine', 'zyrtec']],
  ['doxycycline', ['doxycycline']],
  ['salbutamol', ['salbutamol', 'ventolin']],
];
const KEY_LABEL = {
  'co-amoxiclav': 'co-amoxiclav', 'co-trimoxazole': 'co-trimoxazole', paracetamol: 'paracetamol', ibuprofen: 'ibuprofen',
  amoxicillin: 'amoxicillin', omeprazole: 'omeprazole', azithromycin: 'azithromycin', ciprofloxacin: 'ciprofloxacin',
  metronidazole: 'metronidazole', mefenamic: 'mefenamic acid', aspirin: 'aspirin', diclofenac: 'diclofenac',
  metformin: 'metformin', cetirizine: 'cetirizine', doxycycline: 'doxycycline', salbutamol: 'salbutamol',
};
const CLASS_OF = {
  ibuprofen: 'nsaid', diclofenac: 'nsaid', mefenamic: 'nsaid', aspirin: 'nsaid',
  amoxicillin: 'penicillin', 'co-amoxiclav': 'penicillin',
  omeprazole: 'ppi', azithromycin: 'macrolide', ciprofloxacin: 'quinolone',
  'co-trimoxazole': 'sulfa', doxycycline: 'tetracycline',
};
const CLASS_LABEL = {
  nsaid: 'NSAID painkillers', penicillin: 'penicillins', ppi: 'acid reducers (PPIs)', macrolide: 'macrolide antibiotics',
  quinolone: 'quinolone antibiotics', sulfa: 'sulfa drugs', tetracycline: 'tetracyclines',
};
const ALLERGY_TERMS = [
  { re: /penicil|amoxi|augmentin|amoxil|amoxiclav/i, cls: 'penicillin' },
  { re: /sulf|sulph|septran|trimox/i, cls: 'sulfa' },
  { re: /nsaid|ibuprofen|brufen|diclofenac|aspirin|disprin|mefenamic|ponstan/i, cls: 'nsaid' },
  { re: /quinolone|cipro/i, cls: 'quinolone' },
  { re: /macrolide|azithro|erythro|clarithro/i, cls: 'macrolide' },
  { re: /tetracycline|doxy/i, cls: 'tetracycline' },
  { re: /paracetamol|panadol|calpol|acetaminophen/i, key: 'paracetamol' },
  { re: /metronidazole|flagyl/i, key: 'metronidazole' },
];
/* Sample dose limits for the "gross mismatch" check. Not a clinical reference. */
const DOSE_RULES = {
  paracetamol: { adultMax: 4000, childMgKg: 75 },
  ibuprofen: { adultMax: 3200, childMgKg: 40, minAgeY: 0.25, minAgeText: 'not usually given under 3 months' },
  'co-amoxiclav': { adultMax: 4000, childMgKg: 100 },
  amoxicillin: { adultMax: 4000, childMgKg: 100 },
  omeprazole: { adultMax: 80 },
  azithromycin: { adultMax: 2000, childMgKg: 20 },
  ciprofloxacin: { adultMax: 1500, minAgeY: 18, minAgeText: 'usually avoided under 18 unless there is no alternative' },
  metronidazole: { adultMax: 2400, childMgKg: 50 },
  mefenamic: { adultMax: 1500 },
  aspirin: { adultMax: 4000, minAgeY: 16, minAgeText: 'avoided under 16 (risk of Reye’s syndrome)' },
  diclofenac: { adultMax: 150 },
  metformin: { adultMax: 2550, minAgeY: 10, minAgeText: 'not used under 10' },
  cetirizine: { adultMax: 20 },
  doxycycline: { adultMax: 200, minAgeY: 8, minAgeText: 'avoided under 8 (tooth staining)' },
};

/* Quick picks */
const COMPLAINT_PICKS = ['Fever', 'Cough', 'Sore throat', 'Body aches', 'Headache', 'Vomiting', 'Loose motions', 'Abdominal pain', 'Burning urine', 'Shortness of breath'];
const DIAGNOSIS_PICKS = ['Acute tonsillopharyngitis', 'Upper respiratory tract infection', 'Acute gastroenteritis', 'Enteric fever', 'Dengue fever', 'Urinary tract infection', 'Hypertension', 'Type 2 diabetes mellitus', 'Migraine', 'Acid peptic disease'];
const TEST_PICKS = ['CBC with ESR', 'C-reactive protein (CRP)', 'LFTs', 'RFTs', 'Serum electrolytes', 'Blood sugar (random)', 'HbA1c', 'Lipid profile', 'Urine R/E', 'Urine C/S', 'Blood C/S', 'Typhidot', 'Dengue NS1', 'Malaria parasite (MP)', 'TSH', 'Chest X-ray', 'Ultrasound abdomen', 'ECG'];
const ADVICE_PICKS = [
  { ur: 'نیم گرم پانی زیادہ پئیں، ٹھنڈی اور کھٹی چیزوں سے پرہیز کریں', en: 'Drink warm water; avoid cold and sour food' },
  { ur: 'اینٹی بائیوٹک کا کورس پورا کریں، طبیعت بہتر ہونے پر بھی نہ چھوڑیں', en: 'Complete the antibiotic course' },
  { ur: 'سانس میں دشواری ہو یا ۴۸ گھنٹے بعد بھی تیز بخار رہے تو فوراً رابطہ کریں', en: 'Return at once if breathless or fever after 48 h' },
  { ur: 'آرام کریں', en: 'Rest' },
  { ur: 'او آر ایس کا محلول تھوڑا تھوڑا پیتے رہیں', en: 'Keep sipping ORS' },
  { ur: 'نمک کم کھائیں', en: 'Reduce salt' },
  { ur: 'میٹھی چیزوں اور کولڈ ڈرنک سے پرہیز کریں', en: 'Avoid sweets and soft drinks' },
  { ur: 'روزانہ ۳۰ منٹ پیدل چلیں', en: 'Walk 30 minutes daily' },
  { ur: 'دوا وقت پر لیں، خود سے بند نہ کریں', en: 'Take medicines on time; do not stop on your own' },
];
const FOLLOW_PICKS = [
  { n: 3, unit: 'days' }, { n: 5, unit: 'days' }, { n: 1, unit: 'weeks' }, { n: 2, unit: 'weeks' }, { n: 1, unit: 'months' }, { n: 3, unit: 'months' },
];

/* ================= Medicine text builders ================= */
function doseNum(d) {
  const s = clean(d);
  if (s === '½') return 0.5;
  if (s === '1½') return 1.5;
  const n = parseFloat(s);
  return Number.isNaN(n) ? 0 : n;
}
function medTitle(m) {
  const f = FORMS[m.form] || FORMS.Tab;
  const name = clean(m.name);
  const post = f.post && !name.toLowerCase().includes(f.post.replace(/s$/, '')) ? f.post : '';
  return [f.pre, name, clean(m.strength), post].filter(Boolean).join(' ');
}
function enDose(m) {
  const f = FORMS[m.form] || FORMS.Tab;
  if (f.layer) return 'Thin layer';
  const d = clean(m.dose);
  if (!d) return '';
  if (f.ml) return m.route === 'Gargle' ? `${d} ml in ½ glass warm water` : `${d} ml`;
  return `${d} ${f.unit[doseNum(d) > 1 ? 1 : 0]}`;
}
function freqEn(m) {
  const fr = FREQ_MAP[m.freq];
  if (!fr) return '';
  if (m.freq === 'Stat') return 'Once, immediately (stat)';
  let s = `${fr.en} (${m.freq})`;
  if (m.freq === 'SOS' && m.sosMax) s += `, max ${m.sosMax} times a day`;
  return s;
}
const timingEn = (m) => (TIMING_MAP[m.timing] ? TIMING_MAP[m.timing].en : '');
const routeEn = (m) => (ROUTE_MAP[m.route] ? ROUTE_MAP[m.route].en : '');
function enDuration(m) {
  if (m.durU === 'continue') return 'Continue';
  const n = clean(m.durN);
  if (!n) return '';
  const one = n === '1';
  if (m.durU === 'weeks') return one ? '1 week' : `${n} weeks`;
  if (m.durU === 'months') return one ? '1 month' : `${n} months`;
  return one ? '1 day' : `${n} days`;
}
function enLine(m) {
  return [enDose(m), routeEn(m), freqEn(m), timingEn(m), enDuration(m)].filter(Boolean).join(' · ');
}
function urDose(m) {
  const f = FORMS[m.form] || FORMS.Tab;
  if (f.layer) return 'پتلی تہہ';
  const d = clean(m.dose);
  if (!d) return '';
  if (f.ml) {
    const sp = SPOONS[d];
    return sp ? `${sp} (${urDigits(d)} ملی لیٹر)` : `${urDigits(d)} ملی لیٹر`;
  }
  const word = UR_NUM[d] || urDigits(d);
  return `${word} ${f.ur ? f.ur[doseNum(d) > 1 ? 1 : 0] : ''}`.trim();
}
function urDuration(m) {
  if (m.durU === 'continue') return 'مسلسل جاری رکھیں';
  const n = clean(m.durN);
  if (!n) return '';
  if (m.durU === 'weeks') return n === '1' ? 'ایک ہفتہ' : `${urDigits(n)} ہفتے`;
  if (m.durU === 'months') return n === '1' ? 'ایک مہینہ' : `${urDigits(n)} مہینے`;
  return `${urDigits(n)} دن`;
}
function urLine(m) {
  if (m.urduEdited && clean(m.urdu)) return clean(m.urdu);
  const r = ROUTE_MAP[m.route] || {};
  const d = urDose(m);
  const fr = FREQ_MAP[m.freq];
  let main = '';
  if (m.route === 'Gargle') {
    main = d ? `آدھے گلاس نیم گرم پانی میں ${d} ملا کر غرارے کریں` : 'نیم گرم پانی میں ملا کر غرارے کریں';
    if (fr) main += `، ${fr.ur}`;
  } else {
    let verb = r.verb || '';
    if (m.form === 'Sachet') verb = 'پانی میں گھول کر پئیں';
    if (m.form === 'Spray') verb = 'کریں';
    const act = [r.pre, d, verb].filter(Boolean).join(' ');
    const plainOral = m.route === 'Oral' && d && m.form !== 'Sachet';
    if (fr && plainOral && m.freq === 'BD') main = `${d} صبح، ${d} رات`;
    else if (fr && plainOral && m.freq === 'TDS') main = `${d} صبح، ${d} دوپہر، ${d} رات`;
    else if (fr && plainOral && m.freq === 'OD') main = `${d} روزانہ ایک بار`;
    else if (fr && plainOral && m.freq === 'HS') main = `${d} رات سونے سے پہلے`;
    else if (fr && m.freq === 'SOS') main = `ضرورت ہو تو ${act}`.trim();
    else if (fr) main = act ? `${act}، ${fr.ur}` : fr.ur;
    else main = act;
  }
  const parts = [];
  if (main) parts.push(main);
  if (m.freq === 'SOS' && m.sosMax) parts.push(`دن میں ${UR_COUNT[m.sosMax] || urDigits(m.sosMax)} بار سے زیادہ نہیں`);
  if (TIMING_MAP[m.timing]) parts.push(TIMING_MAP[m.timing].ur);
  const du = urDuration(m);
  if (du) parts.push(du);
  if (m.route === 'Gargle') parts.push('نگلیں نہیں');
  return parts.join(' — ');
}
function durDays(m) {
  const n = parseFloat(m.durN);
  if (m.durU === 'continue' || !n) return 0;
  if (m.durU === 'weeks') return n * 7;
  if (m.durU === 'months') return n * 30;
  return n;
}
function autoQty(m) {
  const f = FORMS[m.form] || FORMS.Tab;
  if (!f.countable) return f.pack || '';
  const n = doseNum(m.dose);
  if (!n) return '';
  if (m.freq === 'Stat') return String(Math.ceil(n));
  const days = durDays(m);
  if (!days) return '';
  let per = FREQ_MAP[m.freq] ? FREQ_MAP[m.freq].perDay : null;
  if (m.freq === 'SOS') per = Number(m.sosMax) || 3;
  if (m.freq === 'Weekly') return String(Math.ceil(n * Math.ceil(days / 7)));
  if (!per) return '';
  return String(Math.ceil(n * per * days));
}
function newMed() {
  return {
    id: uid(), form: 'Tab', name: '', strength: '', generic: '', dose: '1', route: 'Oral', freq: 'BD', sosMax: '',
    timing: 'after', durN: '5', durU: 'days', qty: '', qtyAuto: true, note: '', urdu: '', urduEdited: false,
  };
}
function mkMed(over) {
  const m = { ...newMed(), ...over };
  m.qty = autoQty(m);
  return m;
}

/* ================= Safety checks ================= */
function resolveKey(m) {
  const hay = `${m.name} ${m.generic}`.toLowerCase();
  for (const [key, aliases] of KEY_ALIASES) if (aliases.some((a) => hay.includes(a))) return key;
  return null;
}
function parseStrength(s) {
  const t = clean(s).toLowerCase().replace(/\s+/g, '');
  const toMg = (v, u) => (u === 'g' ? v * 1000 : u === 'mcg' ? v / 1000 : v);
  let x = t.match(/^([\d.]+)(mg|g|mcg)\/([\d.]+)ml$/);
  if (x) return { perMl: toMg(parseFloat(x[1]), x[2]) / parseFloat(x[3]) };
  x = t.match(/^([\d.]+)(mg|g|mcg)$/);
  if (x) return { mg: toMg(parseFloat(x[1]), x[2]) };
  return null;
}
/* Medicine and strength are typed together ("Augmentin 1 g"); pull the strength back out for dose checks. */
function extractStrength(text) {
  const x = clean(text).match(/(\d+(?:\.\d+)?)\s*(mg|g|mcg)(?:\s*\/\s*(\d+(?:\.\d+)?)\s*ml)?(?![a-z])/i);
  if (!x) return '';
  return x[3] ? `${x[1]}${x[2]}/${x[3]}ml` : `${x[1]}${x[2]}`;
}
const baseName = (text) => clean(text).replace(/\s+\d.*$/, '').trim();
function dailyMg(m) {
  const st = parseStrength(clean(m.strength) || extractStrength(m.name));
  if (!st) return 0;
  const n = doseNum(m.dose);
  if (!n) return 0;
  const f = FORMS[m.form] || FORMS.Tab;
  let perAdmin = 0;
  if (st.mg && f.countable) perAdmin = st.mg * n;
  else if (st.perMl && f.ml) perAdmin = st.perMl * n;
  if (!perAdmin) return 0;
  const per = { OD: 1, BD: 2, TDS: 3, QID: 4, HS: 1, Stat: 1, SOS: Number(m.sosMax) || 4 }[m.freq];
  return per ? perAdmin * per : 0;
}
function ageYears(p) {
  const a = parseFloat(p.age);
  if (Number.isNaN(a)) return null;
  if (p.ageUnit === 'M') return a / 12;
  if (p.ageUnit === 'D') return a / 365;
  return a;
}
function ageText(p) {
  const a = clean(p.age);
  if (!a) return '';
  return `${a} ${p.ageUnit === 'M' ? 'months' : p.ageUnit === 'D' ? 'days' : 'years'}`;
}
function checkRx(rx) {
  const out = [];
  const p = rx.patient;
  const ageY = ageYears(p);
  const wt = parseFloat(p.weight);
  const allergy = clean(p.allergies);
  const terms = !allergy || /^(none|nil|nkda|no known)/i.test(allergy)
    ? [] : allergy.split(/[,;/]+/).map(clean).filter(Boolean);
  const meds = rx.meds.filter((m) => clean(m.name));
  const keys = meds.map(resolveKey);

  meds.forEach((m, i) => {
    const key = keys[i];
    const title = medTitle(m);
    for (const term of terms) {
      const rule = ALLERGY_TERMS.find((a) => a.re.test(term));
      let why = '';
      if (rule && rule.cls && key && CLASS_OF[key] === rule.cls) why = `It is one of the ${CLASS_LABEL[rule.cls]}.`;
      else if (rule && rule.key && key === rule.key) why = `It contains ${KEY_LABEL[key]}.`;
      else if (term.length >= 4 && `${m.name} ${m.generic}`.toLowerCase().includes(term.toLowerCase())) why = 'The name matches the allergy.';
      if (why) { out.push({ id: m.id, kind: 'allergy', text: `Allergy: patient is allergic to ${term}. ${title} — ${why}` }); break; }
    }
    const rule = key ? DOSE_RULES[key] : null;
    if (rule && ageY != null && rule.minAgeY && ageY < rule.minAgeY) {
      out.push({ id: m.id, kind: 'age', text: `Age: ${KEY_LABEL[key]} is ${rule.minAgeText}. Patient is ${ageText(p)}.` });
    }
    if (ageY != null && ageY < 2 && (m.form === 'Tab' || m.form === 'Cap')) {
      out.push({ id: m.id, kind: 'age', text: `Form: ${m.form === 'Tab' ? 'a tablet' : 'a capsule'} for a child under 2. A syrup or drops may suit better.` });
    }
    if (rule) {
      const daily = dailyMg(m);
      if (daily) {
        const child = ageY != null && ageY < 12;
        if (child && rule.childMgKg) {
          if (wt > 0) {
            const perKg = daily / wt;
            if (perKg > rule.childMgKg * 1.1) out.push({ id: m.id, kind: 'dose', text: `Dose: ${fmtMg(daily)} a day is ${Math.round(perKg)} mg/kg/day for ${wt} kg. Usual maximum is ${rule.childMgKg} mg/kg/day.` });
          } else {
            out.push({ id: m.id, kind: 'info', text: 'Add the child’s weight so this dose can be checked.' });
          }
        }
        if (daily > rule.adultMax) out.push({ id: m.id, kind: 'dose', text: `Dose: ${fmtMg(daily)} a day is above the usual maximum of ${fmtMg(rule.adultMax)} a day for ${KEY_LABEL[key]}.` });
      }
    }
  });

  for (let i = 0; i < meds.length; i += 1) {
    for (let j = i + 1; j < meds.length; j += 1) {
      const a = meds[i], b = meds[j], ka = keys[i], kb = keys[j];
      if (ka && ka === kb) out.push({ id: b.id, kind: 'duplicate', text: `Duplicate: ${medTitle(a)} and ${medTitle(b)} both contain ${KEY_LABEL[ka]}.` });
      else if (ka && kb && CLASS_OF[ka] && CLASS_OF[ka] === CLASS_OF[kb]) out.push({ id: b.id, kind: 'duplicate', text: `Same group: ${medTitle(a)} and ${medTitle(b)} are both ${CLASS_LABEL[CLASS_OF[ka]]}.` });
      else if (!ka && clean(a.name).toLowerCase() === clean(b.name).toLowerCase()) out.push({ id: b.id, kind: 'duplicate', text: `Duplicate: ${clean(b.name)} is written twice.` });
    }
  }
  return out;
}
function missingFields(rx) {
  const p = rx.patient;
  const m = [];
  if (!clean(p.name)) m.push({ k: 'name', t: 'patient name' });
  if (!clean(p.age)) m.push({ k: 'age', t: 'age' });
  if (!clean(p.sex)) m.push({ k: 'sex', t: 'sex' });
  if (!clean(rx.diagnosis)) m.push({ k: 'diagnosis', t: 'diagnosis' });
  return m;
}

/* ================= Prescription data ================= */
function blankRx() {
  const d = new Date();
  return {
    id: newRxId(d), createdAt: d.toISOString(), sample: false, prev: null,
    patient: { pid: '', name: '', age: '', ageUnit: 'Y', sex: '', weight: '', phone: '', address: '', allergies: '', visit: '' },
    complaints: '', vitals: { bpSys: '', bpDia: '', pulse: '', temp: '', spo2: '', rr: '', sugar: '' },
    diagnosis: '', meds: [], tests: [], advice: [], followUp: null,
  };
}
function sampleRx() {
  const rx = blankRx();
  return {
    ...rx,
    sample: true,
    patient: { name: 'Muhammad Asif', age: '34', ageUnit: 'Y', sex: 'Male', weight: '72', phone: '', address: '', allergies: 'None known', visit: 'In-clinic' },
    complaints: 'Fever, sore throat and body aches for 3 days',
    vitals: { bpSys: '120', bpDia: '80', pulse: '96', temp: '101', spo2: '98', rr: '18', sugar: '' },
    diagnosis: 'Acute tonsillopharyngitis',
    meds: [
      mkMed({ form: 'Tab', name: 'Augmentin 1 g', generic: 'Amoxicillin + Clavulanic acid', dose: '1', route: 'Oral', freq: 'BD', timing: 'after', durN: '5' }),
      mkMed({ form: 'Tab', name: 'Paracetamol 500 mg', generic: '', dose: '2', route: 'Oral', freq: 'SOS', sosMax: '3', timing: '', durN: '3' }),
      mkMed({ form: 'Cap', name: 'Risek 20 mg', generic: 'Omeprazole', dose: '1', route: 'Oral', freq: 'OD', timing: 'breakfast', durN: '5' }),
      mkMed({ form: 'Gargle', name: 'Betadine Gargle 1%', generic: 'Povidone-iodine', dose: '10', route: 'Gargle', freq: 'TDS', timing: '', durN: '5' }),
    ],
    tests: ['CBC with ESR', 'C-reactive protein (CRP)'],
    advice: [ADVICE_PICKS[0].ur, ADVICE_PICKS[1].ur, ADVICE_PICKS[2].ur],
    followUp: { kind: 'after', n: 5, unit: 'days' },
  };
}
function vitalsList(v) {
  const out = [];
  if (clean(v.bpSys) || clean(v.bpDia)) out.push({ k: 'bp', label: 'BP', value: [clean(v.bpSys), clean(v.bpDia)].filter(Boolean).join('/'), unit: 'mmHg' });
  if (clean(v.pulse)) out.push({ k: 'pulse', label: 'Pulse', value: clean(v.pulse), unit: '/min' });
  if (clean(v.temp)) out.push({ k: 'temp', label: 'Temp', value: clean(v.temp), unit: '°F' });
  if (clean(v.spo2)) out.push({ k: 'spo2', label: 'SpO₂', value: clean(v.spo2), unit: '%' });
  if (clean(v.rr)) out.push({ k: 'rr', label: 'Resp. rate', value: clean(v.rr), unit: '/min' });
  if (clean(v.sugar)) out.push({ k: 'sugar', label: 'Blood sugar', value: clean(v.sugar), unit: 'mg/dL' });
  return out;
}
function followText(fu, base) {
  if (!fu) return null;
  if (fu.kind === 'sos') return { en: 'If not better', ur: 'طبیعت بہتر نہ ہو تو دوبارہ دکھائیں' };
  if (fu.kind === 'date' && fu.date) {
    const d = new Date(`${fu.date}T09:00:00`);
    if (Number.isNaN(d.getTime())) return null;
    return { en: fmtDate(d), ur: `${urDate(d)} کو دوبارہ دکھائیں` };
  }
  if (fu.kind === 'after') {
    const days = fu.unit === 'weeks' ? fu.n * 7 : fu.unit === 'months' ? fu.n * 30 : fu.n;
    const d = addDays(base, days);
    const unitEn = fu.n === 1 ? fu.unit.replace(/s$/, '') : fu.unit;
    const unitUr = fu.unit === 'weeks' ? 'ہفتے' : fu.unit === 'months' ? 'مہینے' : 'دن';
    const nUr = fu.n === 1 && fu.unit !== 'days' ? 'ایک' : urDigits(fu.n);
    return { en: `${fmtDate(d)} · after ${fu.n} ${unitEn}`, ur: `${nUr} ${unitUr} بعد دوبارہ دکھائیں` };
  }
  return null;
}
function buildDoc(rawPad, rx) {
  const pad = normalizePad(rawPad);
  const issued = new Date(rx.createdAt);
  const p = rx.patient;
  const ageSex = [clean(p.age) ? `${clean(p.age)} ${p.ageUnit}` : '', clean(p.sex)].filter(Boolean).join(' · ');
  const fields = [];
  if (clean(p.name)) fields.push({ k: 'name', label: 'Patient', value: clean(p.name) });
  if (ageSex) fields.push({ k: 'agesex', label: 'Age/Sex', value: ageSex });
  if (clean(p.weight)) fields.push({ k: 'weight', label: 'Weight', value: `${clean(p.weight)} kg` });
  fields.push({ k: 'date', label: 'Date', value: fmtDateTime(issued) });
  if (clean(p.phone)) fields.push({ k: 'phone', label: 'Phone', value: maskPhone(p.phone) });
  if (clean(p.visit)) fields.push({ k: 'visit', label: 'Visit', value: clean(p.visit) });
  if (clean(p.allergies)) fields.push({ k: 'allergies', label: 'Allergies', value: clean(p.allergies) });
  if (clean(p.address)) fields.push({ k: 'address', label: 'Address', value: clean(p.address) });
  const blank = !!rx.blank;
  const hand = rx.hand || null;
  if (blank) {
    fields.length = 0;
    fields.push({ k: 'name', label: 'Patient', value: '' }, { k: 'agesex', label: 'Age/Sex', value: '' }, { k: 'weight', label: 'Weight', value: '' }, { k: 'date', label: 'Date', value: hand && hand.dateText ? hand.dateText : '' });
  }
  const boxes = blank && !(hand && hand.boxes === false);
  const quals = degreesText(pad.doctor);
  const handQr = hand ? [
    `PakMed Rx sheet ${hand.sheetId}`,
    [pad.doctor.name, quals].filter(Boolean).join(', '),
    pad.doctor.pmdc ? `PMDC Reg. No. ${pad.doctor.pmdc}` : '',
    pad.clinic.name,
    `Printed ${hand.printedText}`,
  ].filter(Boolean).join('\n') : '';
  const meds = rx.meds.filter((m) => clean(m.name)).map((m) => ({
    id: m.id, title: medTitle(m), generic: clean(m.generic), en: enLine(m), ur: urLine(m), qty: clean(m.qty), note: clean(m.note),
    doseRoute: [enDose(m), routeEn(m)].filter(Boolean).join(' · '),
    freqTiming: [freqEn(m), timingEn(m)].filter(Boolean).join(' · '),
    duration: enDuration(m),
  }));
  return {
    accent: pad.accent, tint: mix(pad.accent, 0.07), tint2: mix(pad.accent, 0.16),
    doctor: { ...pad.doctor, quals: degreesText(pad.doctor) }, clinic: pad.clinic,
    alsoAt: alsoAtLines(pad), alsoAtText: alsoAtLines(pad).join('   |   '),
    hasClinic: !!(pad.clinic.name || pad.clinic.address || pad.clinic.phone || pad.clinic.timings),
    issuedText: blank ? '' : fmtDateTime(issued), rxId: blank ? '' : rx.id,
    editedText: !blank && rx.editedAt ? fmtDateTime(new Date(rx.editedAt)) : '',
    patient: p, fields, ageSex, blank,
    hand: hand ? { ...hand, qrText: handQr } : null,
    rxQr: blank ? '' : [
      `PakMed e-Prescription ${rx.id}`,
      [pad.doctor.name, pad.doctor.pmdc ? `PMDC ${pad.doctor.pmdc}` : ''].filter(Boolean).join(', '),
      pad.clinic.name, `Issued ${fmtDateTime(issued)}`,
      rx.editedAt ? `Edited ${fmtDateTime(new Date(rx.editedAt))}` : '',
    ].filter(Boolean).join('\n'),
    complaints: clean(rx.complaints), vitals: blank ? (boxes ? BLANK_VITALS : []) : vitalsList(rx.vitals), diagnosis: clean(rx.diagnosis),
    meds, tests: rx.tests.filter(Boolean), advice: rx.advice.filter(Boolean), followUp: followText(rx.followUp, issued),
    show: {
      complaints: boxes || !!clean(rx.complaints), diagnosis: boxes || !!clean(rx.diagnosis),
      tests: boxes || rx.tests.filter(Boolean).length > 0, followUp: boxes || !!rx.followUp, meds: blank || meds.length > 0,
    },
  };
}
const BLANK_VITALS = [
  { k: 'bp', label: 'BP', value: '', unit: 'mmHg' }, { k: 'pulse', label: 'Pulse', value: '', unit: '/min' },
  { k: 'temp', label: 'Temp', value: '', unit: '°F' }, { k: 'spo2', label: 'SpO₂', value: '', unit: '%' },
];
/* A blank pad: the letterhead with empty patient lines and an empty ℞ area, used for every template and pad preview. */
const BLANK_RX = { ...blankRx(), id: 'blank', blank: true };
/* When choosing a template, show where details go even if the doctor hasn't typed them yet. */
function withPlaceholders(pad) {
  const p = normalizePad(pad);
  const doc = p.doctor;
  return {
    ...p,
    doctor: {
      ...doc,
      name: clean(doc.name) || 'Dr. Your Name',
      degrees: doc.degrees.filter((g) => clean(g)).length ? doc.degrees : ['Your qualifications'],
      pmdc: clean(doc.pmdc) || '00000-P',
      nameUr: clean(doc.nameUr) || 'ڈاکٹر کا نام',
    },
    clinic: {
      name: clean(p.clinic.name) || 'Clinic or hospital name',
      address: clean(p.clinic.address) || 'Clinic address',
      phone: clean(p.clinic.phone) || 'Phone number',
      timings: clean(p.clinic.timings) || 'Days and timings',
    },
  };
}
function buildMessage(pad, rx) {
  const d = buildDoc(pad, rx);
  const lines = [];
  lines.push(`*Prescription* — ${d.doctor.name}${d.clinic.name ? `, ${d.clinic.name}` : ''}`);
  lines.push(`Patient: ${[clean(d.patient.name), ageText(d.patient), clean(d.patient.sex)].filter(Boolean).join(', ')}`);
  lines.push(`Date: ${d.issuedText}`);
  if (d.editedText) lines.push(`Edited*: ${d.editedText}`);
  lines.push(`Rx ID: ${d.rxId}`);
  if (d.diagnosis) lines.push('', `Diagnosis: ${d.diagnosis}`);
  if (d.meds.length) {
    lines.push('', 'Medicines:');
    d.meds.forEach((m, i) => {
      lines.push(`${i + 1}. ${m.title}${m.generic ? ` (${m.generic})` : ''}`);
      if (m.en) lines.push(`   ${m.en}`);
      if (m.ur) lines.push(`   ${m.ur}`);
    });
  }
  if (d.tests.length) lines.push('', `Tests: ${d.tests.join(', ')}`);
  if (d.advice.length) { lines.push('', 'Advice / ہدایات:'); d.advice.forEach((a) => lines.push(`• ${a}`)); }
  if (d.followUp) lines.push('', `Follow-up: ${d.followUp.en}`);
  lines.push('', 'e-Prescription via PakMed. Scan the QR code on the PDF to verify it.');
  return lines.join('\n');
}
function waLink(phone, text) {
  let digits = clean(phone).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = `92${digits.slice(1)}`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/* ================= My prescriptions (saved folder) ================= */
const SAVED_KEY = 'pakmed-rxpad-saved-v4';
const OLD_SAVED_KEYS = ['pakmed-rxpad-saved-v3', 'pakmed-rxpad-saved-v2', 'pakmed-rxpad-saved-v1'];
const rxCore = (r) => JSON.stringify([r.patient, r.complaints, r.vitals, r.diagnosis, r.meds, r.tests, r.advice, r.followUp]);
function seedSaved() {
  const now = new Date();
  const at = (daysAgo, h, m) => {
    if (daysAgo === 0) return new Date(now.getTime() - 95 * 60000);
    const d = addDays(now, -daysAgo); d.setHours(h, m, 0, 0); return d;
  };
  const b = blankRx();
  const mk = (d, padId, over) => ({
    ...b, ...over, id: newRxId(d), createdAt: d.toISOString(), savedAt: d.toISOString(), sentAt: d.toISOString(), padId,
    padSnapshot: JSON.parse(JSON.stringify(SAMPLE_PADS.find((p) => p.id === padId))), example: true, sample: false,
  });
  const asif = { ...b.patient, pid: 'pt-asif', name: 'Muhammad Asif', age: '34', sex: 'Male', weight: '72', phone: '0321-1234567', allergies: 'None known', visit: 'In-clinic' };
  const fatima = { ...b.patient, pid: 'pt-fatima', name: 'Fatima Bibi', age: '52', sex: 'Female', weight: '68', phone: '0300-7654321', allergies: 'None known', visit: 'In-clinic' };
  const s = sampleRx();
  return [
    mk(at(0), 'pad-lifecare', {
      patient: asif, complaints: s.complaints, vitals: s.vitals, diagnosis: s.diagnosis,
      meds: s.meds, tests: s.tests, advice: s.advice, followUp: s.followUp,
    }),
    mk(at(1, 19, 40), 'pad-lifecare', {
      patient: fatima,
      complaints: 'Follow-up. Less thirst, sugar readings better. No new complaints.',
      vitals: { ...b.vitals, bpSys: '128', bpDia: '82', sugar: '158' },
      diagnosis: 'Type 2 diabetes mellitus',
      meds: [mkMed({ form: 'Tab', name: 'Glucophage 500 mg', generic: 'Metformin', dose: '1', freq: 'BD', timing: 'after', durN: '1', durU: 'months' })],
      tests: ['HbA1c'],
      advice: [ADVICE_PICKS[6].ur, ADVICE_PICKS[7].ur, ADVICE_PICKS[8].ur],
      followUp: { kind: 'after', n: 3, unit: 'months' },
    }),
    mk(at(2, 11, 15), 'pad-jilani', {
      patient: { ...b.patient, pid: 'pt-ali', name: 'Ali Raza', age: '8', sex: 'Male', weight: '24', visit: 'In-clinic' },
      complaints: 'Loose motions and vomiting since yesterday',
      vitals: { ...b.vitals, temp: '99.5', pulse: '104' },
      diagnosis: 'Acute gastroenteritis',
      meds: [
        mkMed({ form: 'Sachet', name: 'ORS', generic: 'Oral rehydration salts', dose: '1', freq: 'SOS', sosMax: '6', timing: '', durN: '3' }),
        mkMed({ form: 'Syp', name: 'Calpol 120 mg/5 ml', generic: 'Paracetamol', dose: '10', freq: 'SOS', sosMax: '4', timing: '', durN: '3' }),
      ],
      advice: [ADVICE_PICKS[4].ur, ADVICE_PICKS[3].ur],
      followUp: { kind: 'sos' },
    }),
    mk(at(5, 18, 5), 'pad-lifecare-ur', {
      patient: { ...b.patient, pid: 'pt-zainab', name: 'Zainab Noor', age: '26', sex: 'Female', weight: '55', allergies: 'Sulfa', visit: 'Tele-consult' },
      complaints: 'Burning urine for 2 days',
      vitals: { ...b.vitals, temp: '99' },
      diagnosis: 'Urinary tract infection',
      meds: [mkMed({ form: 'Tab', name: 'Ciprofloxacin 500 mg', dose: '1', freq: 'BD', timing: 'after', durN: '3' })],
      tests: ['Urine R/E', 'Urine C/S'],
      advice: [ADVICE_PICKS[8].ur],
      followUp: { kind: 'after', n: 5, unit: 'days' },
    }),
    mk(at(6, 20, 10), 'pad-lifecare', {
      patient: { ...b.patient, pid: 'pt-bilal', name: 'Bilal Ahmed', age: '31', sex: 'Male', weight: '70', allergies: 'None known', visit: 'In-clinic' },
      complaints: 'Loose motions with mucus and abdominal cramps for 4 days',
      diagnosis: 'Amoebic dysentery',
      meds: [mkMed({ form: 'Tab', name: 'Flagyl 400 mg', generic: 'Metronidazole', dose: '1', freq: 'TDS', timing: 'after', durN: '7' })],
      tests: ['Stool R/E'],
      advice: [ADVICE_PICKS[4].ur, ADVICE_PICKS[8].ur],
      followUp: { kind: 'after', n: 1, unit: 'weeks' },
    }),
    mk(at(9, 12, 30), 'pad-jilani', {
      patient: { ...b.patient, pid: 'pt-sajid', name: 'Sajid Mehmood', age: '58', sex: 'Male', weight: '84', allergies: 'None known', visit: 'In-clinic' },
      complaints: 'Headache and dizziness off and on for 2 weeks',
      vitals: { ...b.vitals, bpSys: '162', bpDia: '98', pulse: '84' },
      diagnosis: 'Hypertension',
      meds: [mkMed({ form: 'Tab', name: 'Norvasc 5 mg', generic: 'Amlodipine', dose: '1', freq: 'OD', timing: '', durN: '1', durU: 'months' })],
      tests: ['Lipid profile', 'RFTs', 'ECG'],
      advice: [ADVICE_PICKS[5].ur, ADVICE_PICKS[7].ur, ADVICE_PICKS[8].ur],
      followUp: { kind: 'after', n: 2, unit: 'weeks' },
    }),
    mk(at(33, 18, 20), 'pad-lifecare', {
      patient: { ...fatima, weight: '70' },
      complaints: 'Increased thirst and frequent urination for 1 month',
      vitals: { ...b.vitals, bpSys: '130', bpDia: '85', sugar: '212' },
      diagnosis: 'Type 2 diabetes mellitus',
      meds: [mkMed({ form: 'Tab', name: 'Glucophage 500 mg', generic: 'Metformin', dose: '1', freq: 'OD', timing: 'after', durN: '1', durU: 'months' })],
      tests: ['HbA1c', 'Lipid profile', 'RFTs'],
      advice: [ADVICE_PICKS[6].ur, ADVICE_PICKS[7].ur],
      followUp: { kind: 'after', n: 1, unit: 'months' },
    }),
    mk(at(71, 19, 5), 'pad-lifecare', {
      patient: asif,
      complaints: 'Burning in upper abdomen after meals for 2 weeks',
      diagnosis: 'Acid peptic disease',
      meds: [mkMed({ form: 'Cap', name: 'Risek 20 mg', generic: 'Omeprazole', dose: '1', freq: 'OD', timing: 'breakfast', durN: '2', durU: 'weeks' })],
      advice: [ADVICE_PICKS[8].ur],
      followUp: { kind: 'sos' },
    }),
  ];
}

/* Same patient = same patient ID, or the same name and sex (and phone, when both have one). */
const normName = (s) => clean(s).toLowerCase().replace(/[^a-z؀-ۿ ]/g, '').replace(/\s+/g, ' ');
function samePatient(a, b) {
  if (!a || !b) return false;
  if (clean(a.pid) && clean(b.pid)) return a.pid === b.pid;
  if (!normName(a.name) || normName(a.name) !== normName(b.name)) return false;
  if (clean(a.sex) && clean(b.sex) && a.sex !== b.sex) return false;
  const pa = clean(a.phone).replace(/\D/g, ''); const pb = clean(b.phone).replace(/\D/g, '');
  return !(pa && pb && pa !== pb);
}
function visitsOf(saved, patient) {
  return saved.filter((s) => samePatient(s.patient, patient)).sort((x, y) => new Date(y.createdAt) - new Date(x.createdAt));
}

/* ================= Remembered medicine settings =================
   Every time a prescription is saved or sent, each medicine's settings are remembered under its
   name and strength (e.g. "flagyl 400 mg"). The latest use always replaces the earlier one. */
const MEDS_KEY = 'pakmed-rxpad-med-memory-v1';
const MEM_FIELDS = ['form', 'generic', 'dose', 'route', 'freq', 'sosMax', 'timing', 'durN', 'durU', 'note', 'urdu', 'urduEdited'];
const medKey = (name) => clean(name).toLowerCase().replace(/\s+/g, ' ');
/* "Fl" should find Flagyl, not ciproFLoxacin: match only at the start of a word. */
function matchesClue(text, clue) {
  if (!clue) return false;
  const esc = clue.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`(^|[\\s(+/,-])${esc}`, 'i').test(clean(text));
}
function rememberMeds(memory, meds, at) {
  const next = { ...memory };
  meds.filter((m) => clean(m.name)).forEach((m) => {
    const entry = { name: clean(m.name), usedAt: at };
    MEM_FIELDS.forEach((k) => { entry[k] = m[k]; });
    if (!entry.urduEdited) entry.urdu = '';
    next[medKey(m.name)] = entry;
  });
  return next;
}
function settingsFrom(entry) {
  const s = { qtyAuto: true };
  MEM_FIELDS.forEach((k) => { if (entry[k] !== undefined) s[k] = entry[k]; });
  return s;
}
function loadMemory(savedList) {
  const raw = store.get(MEDS_KEY);
  if (raw) {
    try { const v = JSON.parse(raw); if (v && typeof v === 'object' && !Array.isArray(v)) return v; } catch (e) { /* rebuild below */ }
  }
  return [...savedList]
    .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
    .reduce((mem, s) => rememberMeds(mem, s.meds, s.savedAt || s.createdAt), {});
}

function loadSaved() {
  const raw = store.get(SAVED_KEY);
  if (raw) {
    try {
      const v = JSON.parse(raw);
      if (Array.isArray(v)) return v.filter((s) => s && s.id && s.patient);
    } catch (e) { /* fall back to examples */ }
  }
  /* First run of this version: keep anything the doctor saved in the earlier prototype, add the new examples. */
  let kept = [];
  for (const key of OLD_SAVED_KEYS) {
    const old = store.get(key);
    if (!old) continue;
    try { const v = JSON.parse(old); if (Array.isArray(v)) { kept = v.filter((s) => s && s.id && s.patient && !s.example).map((s) => ({ ...s, sentAt: s.sentAt || s.savedAt || s.createdAt })); break; } } catch (e) { /* ignore */ }
  }
  return [...kept, ...seedSaved()];
}
function dayLabel(d, now) {
  const a = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const b = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const diff = Math.round((b - a) / 86400000);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  return fmtDate(d);
}
function prevInfo(entry, saved) {
  return { id: entry.id, date: entry.createdAt, diagnosis: clean(entry.diagnosis), count: visitsOf(saved, entry.patient).length };
}
function patientFrom(entry) {
  const p = JSON.parse(JSON.stringify(entry.patient));
  if (!clean(p.pid)) p.pid = `pt-${uid()}`;
  return p;
}
/* Follow-up: a fresh prescription with only the patient's details filled in. */
function newForPatient(entry, saved) {
  return { ...blankRx(), patient: patientFrom(entry), prev: prevInfo(entry, saved) };
}
/* Repeat: patient, diagnosis, medicines, tests and advice copied; complaints and vitals left for today. */
function repeatRx(entry, saved) {
  const copy = JSON.parse(JSON.stringify(entry));
  return {
    ...blankRx(), patient: patientFrom(entry), prev: prevInfo(entry, saved),
    diagnosis: copy.diagnosis, meds: copy.meds.map((m) => ({ ...m, id: uid() })), tests: copy.tests, advice: copy.advice, followUp: copy.followUp,
  };
}

/* ================= Icons ================= */
const Svg = ({ children, size = 18, className = '' }) => (
  <svg className={`ic ${className}`} width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">{children}</svg>
);
const IconChevron = (p) => <Svg {...p}><path d="M9 6l6 6-6 6" /></Svg>;
const IconDown = (p) => <Svg {...p}><path d="M6 9l6 6 6-6" /></Svg>;
const IconBack = (p) => <Svg {...p}><path d="M15 6l-6 6 6 6" /></Svg>;
const IconCheck = (p) => <Svg {...p}><path d="M5 12.5l4.5 4.5L19 7" /></Svg>;
const IconPlus = (p) => <Svg {...p}><path d="M12 5v14M5 12h14" /></Svg>;
const IconAlert = (p) => <Svg {...p}><path d="M12 4l9 16H3z" /><path d="M12 10v4M12 17.5v.01" /></Svg>;
const IconInfo = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8v.01" /></Svg>;
const IconChat = (p) => <Svg {...p}><path d="M4 19l1.5-4A7.5 7.5 0 1 1 9 18.6z" /><path d="M9 10.5c.5 2 2 3.5 4 4" /></Svg>;
const IconCopy = (p) => <Svg {...p}><rect x="8" y="8" width="11" height="11" rx="2" /><path d="M5 15V6a1 1 0 0 1 1-1h9" /></Svg>;
const IconX = (p) => <Svg {...p}><path d="M6 6l12 12M18 6L6 18" /></Svg>;
const IconPin = (p) => <Svg {...p}><path d="M12 21s-6-5.3-6-10a6 6 0 1 1 12 0c0 4.7-6 10-6 10z" /><circle cx="12" cy="11" r="2.2" /></Svg>;
const IconPhone = (p) => <Svg {...p}><path d="M5 4h3l2 5-2.5 1.5a11 11 0 0 0 6 6L15 14l5 2v3a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></Svg>;
const IconClock = (p) => <Svg {...p}><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></Svg>;
const IconFolder = (p) => <Svg {...p}><path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /></Svg>;
const IconPen = (p) => <Svg {...p}><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></Svg>;
const IconSearch = (p) => <Svg {...p}><circle cx="11" cy="11" r="6.5" /><path d="M16 16l4 4" /></Svg>;
const IconRepeat = (p) => <Svg {...p}><path d="M4 12a7 7 0 0 1 12-5l2 2" /><path d="M18 4v5h-5" /><path d="M20 12a7 7 0 0 1-12 5l-2-2" /><path d="M6 20v-5h5" /></Svg>;
const IconUp = (p) => <Svg {...p}><path d="M6 15l6-6 6 6" /></Svg>;
const IconHome = (p) => <Svg {...p}><path d="M4 11l8-7 8 7" /><path d="M6 10v10h12V10" /></Svg>;
const IconPads = (p) => <Svg {...p}><rect x="5" y="3" width="14" height="18" rx="2" /><path d="M9 8h6M9 12h6M9 16h3" /></Svg>;
const IconPrint = (p) => <Svg {...p}><path d="M7 9V4h10v5" /><rect x="4" y="9" width="16" height="8" rx="2" /><path d="M7 14h10v6H7z" /></Svg>;
const IconLock = (p) => <Svg {...p}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></Svg>;
const IconTrash = (p) => <Svg {...p}><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" /></Svg>;

/* ================= Printed prescription (A4) ================= */
/* Minimal QR encoder: byte mode, error correction M, versions 1–10 (up to ~213 bytes). */
const QR_EC_M = {
  1: [10, [[1, 16]]], 2: [16, [[1, 28]]], 3: [26, [[1, 44]]], 4: [18, [[2, 32]]], 5: [24, [[2, 43]]],
  6: [16, [[4, 27]]], 7: [18, [[4, 31]]], 8: [22, [[2, 38], [2, 39]]], 9: [22, [[3, 36], [2, 37]]], 10: [26, [[4, 43], [1, 44]]],
};
const QR_ALIGN = { 1: [], 2: [6, 18], 3: [6, 22], 4: [6, 26], 5: [6, 30], 6: [6, 34], 7: [6, 22, 38], 8: [6, 24, 42], 9: [6, 26, 46], 10: [6, 28, 50] };
const GF_EXP = new Array(512);
const GF_LOG = new Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i += 1) { GF_EXP[i] = x; GF_LOG[x] = i; x <<= 1; if (x & 0x100) x ^= 0x11d; }
  for (let i = 255; i < 512; i += 1) GF_EXP[i] = GF_EXP[i - 255];
})();
const gfMul = (a, b) => (a === 0 || b === 0 ? 0 : GF_EXP[GF_LOG[a] + GF_LOG[b]]);
function rsRemainder(data, n) {
  let gen = [1];
  for (let i = 0; i < n; i += 1) {
    const next = new Array(gen.length + 1).fill(0);
    for (let j = 0; j < gen.length; j += 1) { next[j] ^= gen[j]; next[j + 1] ^= gfMul(gen[j], GF_EXP[i]); }
    gen = next;
  }
  const res = data.concat(new Array(n).fill(0));
  for (let i = 0; i < data.length; i += 1) {
    const coef = res[i];
    if (coef !== 0) for (let j = 0; j < gen.length; j += 1) res[i + j] ^= gfMul(gen[j], coef);
  }
  return res.slice(data.length);
}
const QR_MASKS = [
  (r, c) => (r + c) % 2 === 0, (r) => r % 2 === 0, (r, c) => c % 3 === 0, (r, c) => (r + c) % 3 === 0,
  (r, c) => (Math.floor(r / 2) + Math.floor(c / 3)) % 2 === 0, (r, c) => ((r * c) % 2) + ((r * c) % 3) === 0,
  (r, c) => (((r * c) % 2) + ((r * c) % 3)) % 2 === 0, (r, c) => (((r + c) % 2) + ((r * c) % 3)) % 2 === 0,
];
function qrPenalty(m) {
  const n = m.length;
  let score = 0;
  for (let pass = 0; pass < 2; pass += 1) {
    for (let a = 0; a < n; a += 1) {
      let run = 1;
      for (let b = 1; b <= n; b += 1) {
        const prev = pass ? m[b - 1][a] : m[a][b - 1];
        const cur = b < n ? (pass ? m[b][a] : m[a][b]) : null;
        if (cur === prev) run += 1;
        else { if (run >= 5) score += run - 2; run = 1; }
      }
    }
  }
  for (let r = 0; r < n - 1; r += 1) for (let c = 0; c < n - 1; c += 1) {
    const v = m[r][c];
    if (v === m[r][c + 1] && v === m[r + 1][c] && v === m[r + 1][c + 1]) score += 3;
  }
  let dark = 0;
  m.forEach((row) => row.forEach((v) => { if (v) dark += 1; }));
  score += Math.floor(Math.abs((dark * 20) / (n * n) - 10)) * 10;
  return score;
}
function qrMatrix(text) {
  const bytes = Array.from(new TextEncoder().encode(text));
  let ver = 0;
  for (let v = 1; v <= 10; v += 1) {
    const cap = QR_EC_M[v][1].reduce((s, [c, d]) => s + c * d, 0);
    if (4 + (v < 10 ? 8 : 16) + bytes.length * 8 <= cap * 8) { ver = v; break; }
  }
  if (!ver) return null;
  const [ecLen, groups] = QR_EC_M[ver];
  const dataCap = groups.reduce((s, [c, d]) => s + c * d, 0);
  const bits = [];
  const put = (val, len) => { for (let i = len - 1; i >= 0; i -= 1) bits.push((val >>> i) & 1); };
  put(4, 4); put(bytes.length, ver < 10 ? 8 : 16); bytes.forEach((b) => put(b, 8));
  for (let i = 0; i < 4 && bits.length < dataCap * 8; i += 1) bits.push(0);
  while (bits.length % 8) bits.push(0);
  const cw = [];
  for (let i = 0; i < bits.length; i += 8) { let b = 0; for (let j = 0; j < 8; j += 1) b = (b << 1) | bits[i + j]; cw.push(b); }
  for (let pad = 0xec; cw.length < dataCap; pad = pad === 0xec ? 0x11 : 0xec) cw.push(pad);
  const blocks = [];
  let off = 0;
  groups.forEach(([count, dlen]) => {
    for (let i = 0; i < count; i += 1) { const d = cw.slice(off, off + dlen); off += dlen; blocks.push({ d, e: rsRemainder(d, ecLen) }); }
  });
  const stream = [];
  const maxD = Math.max(...blocks.map((b) => b.d.length));
  for (let i = 0; i < maxD; i += 1) blocks.forEach((b) => { if (i < b.d.length) stream.push(b.d[i]); });
  for (let i = 0; i < ecLen; i += 1) blocks.forEach((b) => stream.push(b.e[i]));

  const size = ver * 4 + 17;
  const base = Array.from({ length: size }, () => new Array(size).fill(false));
  const fn = Array.from({ length: size }, () => new Array(size).fill(false));
  const set = (r, c, v) => { base[r][c] = v; fn[r][c] = true; };
  const finder = (r0, c0) => {
    for (let r = -1; r <= 7; r += 1) for (let c = -1; c <= 7; c += 1) {
      const rr = r0 + r; const cc = c0 + c;
      if (rr < 0 || cc < 0 || rr >= size || cc >= size) continue;
      const on = (r >= 0 && r <= 6 && (c === 0 || c === 6)) || (c >= 0 && c <= 6 && (r === 0 || r === 6)) || (r >= 2 && r <= 4 && c >= 2 && c <= 4);
      set(rr, cc, on);
    }
  };
  finder(0, 0); finder(0, size - 7); finder(size - 7, 0);
  for (let i = 8; i < size - 8; i += 1) { set(6, i, i % 2 === 0); set(i, 6, i % 2 === 0); }
  const al = QR_ALIGN[ver];
  const last = al[al.length - 1];
  al.forEach((r) => al.forEach((c) => {
    if ((r === 6 && c === 6) || (r === 6 && c === last) || (r === last && c === 6)) return;
    for (let dr = -2; dr <= 2; dr += 1) for (let dc = -2; dc <= 2; dc += 1) set(r + dr, c + dc, Math.max(Math.abs(dr), Math.abs(dc)) !== 1);
  }));
  for (let i = 0; i < 9; i += 1) { if (!fn[8][i]) set(8, i, false); if (!fn[i][8]) set(i, 8, false); }
  for (let i = 0; i < 8; i += 1) { set(8, size - 1 - i, false); set(size - 1 - i, 8, false); }
  set(size - 8, 8, true);
  if (ver >= 7) {
    let rem = ver;
    for (let i = 0; i < 12; i += 1) rem = (rem << 1) ^ ((rem >>> 11) * 0x1f25);
    const vb = (ver << 12) | rem;
    for (let i = 0; i < 18; i += 1) {
      const bit = ((vb >>> i) & 1) === 1;
      const a = size - 11 + (i % 3); const b = Math.floor(i / 3);
      set(a, b, bit); set(b, a, bit);
    }
  }
  let k = 0;
  const total = stream.length * 8;
  for (let right = size - 1; right >= 1; right -= 2) {
    if (right === 6) right = 5;
    for (let vert = 0; vert < size; vert += 1) {
      for (let j = 0; j < 2; j += 1) {
        const c = right - j;
        const upward = ((right + 1) & 2) === 0;
        const r = upward ? size - 1 - vert : vert;
        if (fn[r][c]) continue;
        if (k < total) { base[r][c] = ((stream[k >>> 3] >>> (7 - (k & 7))) & 1) === 1; k += 1; }
      }
    }
  }
  const withFormat = (m, mask) => {
    const data = mask; /* level M = 00 */
    let rem = data;
    for (let i = 0; i < 10; i += 1) rem = (rem << 1) ^ ((rem >>> 9) * 0x537);
    const fb = ((data << 10) | rem) ^ 0x5412;
    const g = (i) => ((fb >>> i) & 1) === 1;
    for (let i = 0; i <= 5; i += 1) m[i][8] = g(i);
    m[7][8] = g(6); m[8][8] = g(7); m[8][7] = g(8);
    for (let i = 9; i < 15; i += 1) m[8][14 - i] = g(i);
    for (let i = 0; i < 8; i += 1) m[8][size - 1 - i] = g(i);
    for (let i = 8; i < 15; i += 1) m[size - 15 + i][8] = g(i);
    m[size - 8][8] = true;
    return m;
  };
  let best = null; let bestScore = Infinity;
  QR_MASKS.forEach((mf, mask) => {
    const m = base.map((row, r) => row.map((v, c) => (fn[r][c] ? v : v !== mf(r, c))));
    withFormat(m, mask);
    const sc = qrPenalty(m);
    if (sc < bestScore) { bestScore = sc; best = m; }
  });
  return best;
}
const QR_CACHE = new Map();
function qrPathFor(text) {
  if (QR_CACHE.has(text)) return QR_CACHE.get(text);
  const m = qrMatrix(text);
  let out = null;
  if (m) {
    let d = '';
    m.forEach((row, r) => row.forEach((v, c) => { if (v) d += `M${c} ${r}h1v1h-1z`; }));
    out = { n: m.length, d };
  }
  QR_CACHE.set(text, out);
  return out;
}
const qrAscii = (s) => String(s || '').replace(/[·•]/g, '-').replace(/[–—]/g, '-').normalize('NFKD').replace(/[^\x20-\x7e\n]/g, '');

function QR({ size = 90, text }) {
  const q = qrPathFor(qrAscii(text || 'PakMed'));
  if (!q) return <div className="qr-ph" style={{ width: size, height: size }}><span>QR</span></div>;
  const pad = 3;
  const v = q.n + pad * 2;
  return (
    <svg className="qr" width={size} height={size} viewBox={`${-pad} ${-pad} ${v} ${v}`} role="img" aria-label="QR code">
      <rect x={-pad} y={-pad} width={v} height={v} fill="#ffffff" />
      <path fill="#111111" d={q.d} />
    </svg>
  );
}
function Lines({ n = 2 }) {
  return <div className="rx-lines" aria-hidden="true">{Array.from({ length: n }).map((_, i) => <span key={i} />)}</div>;
}
function TextOr({ d, v, n = 2, cls = 'rx-text' }) {
  return d.blank ? <Lines n={n} /> : <p className={cls}>{v}</p>;
}
function ListOr({ d, items, n = 2 }) {
  return d.blank ? <Lines n={n} /> : <ul className="rx-list">{items.map((t) => <li key={t}>{t}</li>)}</ul>;
}
function FollowOr({ d }) {
  return d.blank ? <Lines n={1} /> : <><p className="rx-fu">{d.followUp.en}</p><p className="ur rx-fuur" lang="ur">{d.followUp.ur}</p></>;
}
function Verify({ d, inline }) {
  if (d.hand) {
    if (!d.hand.qr) return null;
    return (
      <div className={`rx-qr${inline ? ' inline' : ''}`}>
        <QR size={inline ? 96 : 104} text={d.hand.qrText} />
        <div className="rx-qr-text">
          <p className="t1">Scan for doctor details</p>
          <p className="t2">Sheet {d.hand.sheetId}</p>
          <p className="t2">Printed {d.hand.printedText}</p>
          <p className="via">Printed via PakMed</p>
        </div>
      </div>
    );
  }
  if (d.blank) {
    return (
      <div className={`rx-qr${inline ? ' inline' : ''}`}>
        <div className="qr-ph" style={{ width: inline ? 72 : 90, height: inline ? 72 : 90 }}><span>QR</span></div>
        <div className="rx-qr-text">
          <p className="t1">Scan to verify</p>
          <p className="t2">QR code and Rx ID are added</p>
          <p className="t2">when the prescription is issued</p>
          <p className="via">e-Prescription via PakMed</p>
        </div>
      </div>
    );
  }
  return (
    <div className={`rx-qr${inline ? ' inline' : ''}`}>
      <QR size={inline ? 72 : 90} text={d.rxQr} />
      <div className="rx-qr-text">
        <p className="t1">Scan to verify</p>
        <p className="t2">Rx ID {d.rxId}</p>
        <p className="t2">Issued {d.issuedText}</p>
        <p className="via">e-Prescription via PakMed</p>
        {d.editedText && <p className="edited">Edited* {d.editedText}</p>}
      </div>
    </div>
  );
}
function Signature({ d, className = '' }) {
  return (
    <div className={`rx-sign ${className}`}>
      {d.hand ? <span className="sig-space" aria-hidden="true" /> : d.doctor.signatureImg
        ? <img className="sig-img" src={d.doctor.signatureImg} alt="Signature" />
        : <span className="sig">{clean(d.doctor.signature) || clean(d.doctor.name).replace(/^Dr\.?\s*/, '')}</span>}
      <span className="rule" />
      <span className="nm">{d.doctor.name}</span>
      <span className="cap">Signature &amp; stamp</span>
    </div>
  );
}
function DocMeds({ d, numClass = '' }) {
  return (
    <ol className="rx-meds">
      {d.meds.map((m, i) => (
        <li className="rx-med" key={m.id}>
          <span className={`rx-num ${numClass}`}>{i + 1}</span>
          <div className="rx-medbody">
            <div className="rx-medtop">
              <p className="rx-medname">{m.title}{m.generic && <span className="rx-gen"> ({m.generic})</span>}</p>
              {m.qty && <span className="rx-qty">Qty {m.qty}</span>}
            </div>
            {m.en && <p className="rx-en">{m.en}</p>}
            {m.note && <p className="rx-note">{m.note}</p>}
            {m.ur && <p className="ur rx-urline" lang="ur">{m.ur}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}
function DocAdvice({ d, className }) {
  if (!d.advice.length) return null;
  return (
    <section className={className}>
      <div className="rx-advhead">
        <h2 className="rx-h">Advice</h2>
        <span className="ur rx-advur" lang="ur">ہدایات</span>
      </div>
      <ul className="ur rx-advlist" lang="ur">
        {d.advice.map((a, i) => <li key={i} dir="auto">{a}</li>)}
      </ul>
    </section>
  );
}
function ClinicLines({ c }) {
  return (
    <>
      {c.address && <p className="l"><IconPin size={14} /><span>{c.address}</span></p>}
      {c.phone && <p className="l"><IconPhone size={14} /><span>{c.phone}</span></p>}
      {c.timings && <p className="l"><IconClock size={14} /><span>{c.timings}</span></p>}
    </>
  );
}

function DocClassic({ d }) {
  return (
    <div className={`rx rx-classic${d.blank ? ' is-blank' : ''}`} style={{ '--acc': d.accent, '--tint': d.tint, '--tint2': d.tint2 }}>
      <div className="rxc-bar" />
      <header className="rxc-head">
        <div className="rxc-doc">
          <h1>{d.doctor.name}</h1>
          {d.doctor.quals && <p className="q">{d.doctor.quals}</p>}
          {d.doctor.title && <p className="t">{d.doctor.title}</p>}
          {d.doctor.pmdc && <p className="t sm">PMDC Reg. No. {d.doctor.pmdc}</p>}
        </div>
        <div className="rxc-clinic">
          {d.clinic.name && <p className="n">{d.clinic.name}</p>}
          <ClinicLines c={d.clinic} />
        </div>
      </header>
      <section className="rxc-pt" aria-label="Patient details">
        {d.fields.map((f) => <p key={f.k}><span>{f.label} </span><strong className={f.value ? '' : `bl bl-${f.k}`}>{f.value}</strong></p>)}
      </section>
      <div className="rxc-body">
        <aside className="rxc-aside">
          {d.show.complaints && <section><h2 className="rx-h">Complaints</h2><TextOr d={d} v={d.complaints} n={3} /></section>}
          {d.vitals.length > 0 && (
            <section>
              <h2 className="rx-h">Vitals</h2>
              <div className="rxc-vit">{d.vitals.map((v) => <p key={v.k}><span>{v.label}</span><span>{v.value} {v.unit}</span></p>)}</div>
            </section>
          )}
          {d.show.diagnosis && <section><h2 className="rx-h">Diagnosis</h2><TextOr d={d} v={d.diagnosis} n={2} cls="rx-dx" /></section>}
          {d.show.tests && <section><h2 className="rx-h">Tests advised</h2><ListOr d={d} items={d.tests} n={3} /></section>}
          {d.show.followUp && <section><h2 className="rx-h">Follow-up</h2><FollowOr d={d} /></section>}
          <div className="rxc-verify"><Verify d={d} /></div>
        </aside>
        <main className="rxc-main">
          {d.show.meds && (
            <>
              <div className="rx-rxhead"><span className="rx-glyph" aria-hidden="true">℞</span><span className="rx-label">Medicines</span></div>
              <DocMeds d={d} />
            </>
          )}
          <DocAdvice d={d} className="rx-advice" />
          <Signature d={d} />
        </main>
      </div>
      {d.alsoAt.length > 0 && <footer className="rxc-foot">Also consults at {d.alsoAtText}</footer>}
    </div>
  );
}

function DocBilingual({ d }) {
  const p = d.patient;
  const lines = d.blank ? [
    { k: 'name', l: 'Name', v: '', wide: true }, { k: 'age', l: 'Age', v: '' }, { k: 'sex', l: 'Sex', v: '' },
    { k: 'wt', l: 'Weight', v: '' }, { k: 'date', l: 'Date', v: d.hand && d.hand.dateText ? d.hand.dateText : '', wide: true }, { k: 'al', l: 'Allergies', v: '' },
  ] : [
    clean(p.name) && { k: 'name', l: 'Name', v: clean(p.name), wide: true },
    clean(p.age) && { k: 'age', l: 'Age', v: `${clean(p.age)} ${p.ageUnit}` },
    clean(p.sex) && { k: 'sex', l: 'Sex', v: clean(p.sex) },
    clean(p.weight) && { k: 'wt', l: 'Weight', v: `${clean(p.weight)} kg` },
    { k: 'date', l: 'Date', v: d.issuedText, wide: true },
    clean(p.phone) && { k: 'ph', l: 'Phone', v: maskPhone(p.phone) },
    clean(p.allergies) && { k: 'al', l: 'Allergies', v: clean(p.allergies) },
    clean(p.visit) && { k: 'vi', l: 'Visit', v: clean(p.visit) },
    clean(p.address) && { k: 'ad', l: 'Address', v: clean(p.address), wide: true },
  ].filter(Boolean);
  const lower = [d.advice.length > 0, !!d.followUp].filter(Boolean).length;
  return (
    <div className={`rx rx-bilingual${d.blank ? ' is-blank' : ''}`} style={{ '--acc': d.accent, '--tint': d.tint, '--tint2': d.tint2 }}>
      <div className="rxb-in">
        <header className="rxb-head">
          <div className="rxb-en">
            <h1>{d.doctor.name}</h1>
            {d.doctor.quals && <p className="q">{d.doctor.quals}</p>}
            {d.doctor.title && <p className="t">{d.doctor.title}</p>}
            {d.doctor.pmdc && <p className="pm">PMDC Reg. No. {d.doctor.pmdc}</p>}
          </div>
          <div className="rxb-seal" aria-hidden="true">℞</div>
          <div className="rxb-ur ur" lang="ur">
            {d.doctor.nameUr && <p className="n">{d.doctor.nameUr}</p>}
            {d.doctor.qualsUr && <p className="q">{d.doctor.qualsUr}</p>}
            {d.doctor.titleUr && <p className="t">{d.doctor.titleUr}</p>}
          </div>
        </header>
        <div className="rxb-rule" />
        {(d.clinic.name || d.clinic.address || d.clinic.phone || d.clinic.timings) && (
          <div className="rxb-clinic">
            {(d.clinic.name || d.clinic.address) && <span><IconPin size={14} /><span><strong>{d.clinic.name}</strong>{d.clinic.name && d.clinic.address ? ', ' : ''}{d.clinic.address}</span></span>}
            {d.clinic.phone && <span><IconPhone size={14} />{d.clinic.phone}</span>}
            {d.clinic.timings && <span><IconClock size={14} />{d.clinic.timings}</span>}
          </div>
        )}
        <section className="rxb-pt" aria-label="Patient details">
          {lines.map((x) => <p key={x.k} className={x.wide ? 'wide' : ''}><span className="l">{x.l}</span><span className="v">{x.v}</span></p>)}
        </section>
        <div className="rxb-boxes">
          {(d.show.complaints || d.show.diagnosis) && (
            <section className="rxb-box">
              {d.show.complaints && <><h2 className="rx-h">Complaints</h2><TextOr d={d} v={d.complaints} n={2} /></>}
              {d.show.diagnosis && <><h2 className={`rx-h${d.show.complaints ? ' gap' : ''}`}>Diagnosis</h2><TextOr d={d} v={d.diagnosis} n={1} cls="rx-dx" /></>}
            </section>
          )}
          {d.vitals.length > 0 && (
            <section className="rxb-box">
              <h2 className="rx-h">Vitals</h2>
              <div className="rxb-vit">{d.vitals.map((v) => <p key={v.k}><span>{v.label}</span><span>{v.value} {v.unit}</span></p>)}</div>
            </section>
          )}
          {d.show.tests && (
            <section className="rxb-box">
              <h2 className="rx-h">Tests advised</h2>
              <ListOr d={d} items={d.tests} n={3} />
            </section>
          )}
        </div>
        {d.show.meds && (
          <section className="rxb-meds" aria-label="Medicines">
            <div className="rx-rxhead plain"><span className="rx-glyph" aria-hidden="true">℞</span><span className="rx-label">Medicines</span></div>
            <div className="rxb-grid rxb-th"><span>#</span><span>Medicine</span><span>Dose &amp; route</span><span>Frequency &amp; timing</span><span>Duration</span><span>Qty</span></div>
            {d.meds.map((m, i) => (
              <div className="rxb-med" key={m.id}>
                <div className="rxb-grid rxb-tr">
                  <span className="num">{i + 1}</span>
                  <div><p className="nm">{m.title}</p>{m.generic && <p className="gen">{m.generic}</p>}{m.note && <p className="gen">{m.note}</p>}</div>
                  <span>{m.doseRoute}</span>
                  <span>{m.freqTiming}</span>
                  <span>{m.duration}</span>
                  <span>{m.qty}</span>
                </div>
                {m.ur && <p className="ur rxb-ur" lang="ur"><b>ہدایت: </b>{m.ur}</p>}
              </div>
            ))}
          </section>
        )}
        {lower > 0 && (
          <div className={`rxb-lower${lower === 1 ? ' one' : ''}`}>
            <DocAdvice d={d} className="rx-advice flat" />
            {d.followUp && (
              <section className="rxb-fu">
                <h2 className="rx-h">Follow-up</h2>
                <p className="big">{d.followUp.en.split(' · ')[0]}</p>
                {d.followUp.en.includes(' · ') && <p className="sub">{d.followUp.en.split(' · ')[1]}</p>}
                <p className="ur rx-fuur" lang="ur">{d.followUp.ur}</p>
              </section>
            )}
          </div>
        )}
        <div className="rxb-foot">
          <Verify d={d} inline />
          <Signature d={d} />
        </div>
      </div>
      {d.alsoAt.length > 0 && <footer className="rxb-band">Also consults at {d.alsoAtText}</footer>}
    </div>
  );
}

function DocModern({ d }) {
  const p = d.patient;
  const meta = [ageText(p) ? `${clean(p.age)} ${p.ageUnit}` : '', clean(p.sex), clean(p.weight) ? `${clean(p.weight)} kg` : '', clean(p.visit), clean(p.phone) ? maskPhone(p.phone) : ''].filter(Boolean).join(' · ');
  const pairs = [
    d.show.complaints && <section key="c"><h3 className="rx-h">Complaints</h3><TextOr d={d} v={d.complaints} n={2} /></section>,
    d.show.diagnosis && <section key="d"><h3 className="rx-h">Diagnosis</h3><TextOr d={d} v={d.diagnosis} n={2} cls="rx-dx" /></section>,
    d.show.tests && <section key="t"><h3 className="rx-h">Tests advised</h3><ListOr d={d} items={d.tests} n={2} /></section>,
    d.show.followUp && <section key="f"><h3 className="rx-h">Follow-up</h3><FollowOr d={d} /></section>,
  ].filter(Boolean);
  return (
    <div className={`rx rx-modern${d.blank ? ' is-blank' : ''}`} style={{ '--acc': d.accent, '--tint': d.tint, '--tint2': d.tint2 }}>
      <aside className="rxm-side">
        <div className="rxm-mark" aria-hidden="true">℞</div>
        <div className="rxm-doc">
          <h1>{d.doctor.name}</h1>
          {d.doctor.quals && <p className="q">{d.doctor.quals}</p>}
          {d.doctor.title && <p className="t">{d.doctor.title}</p>}
          {d.doctor.pmdc && <p className="t sm">PMDC Reg. No. {d.doctor.pmdc}</p>}
        </div>
        <div className="rxm-div" />
        {(d.clinic.name || d.clinic.address || d.clinic.phone || d.clinic.timings) && (
          <section className="rxm-clinic">
            <h2 className="rx-h">Clinic</h2>
            {d.clinic.name && <p className="n">{d.clinic.name}</p>}
            <ClinicLines c={d.clinic} />
          </section>
        )}
        {d.alsoAt.length > 0 && <section className="rxm-clinic"><h2 className="rx-h">Also consults at</h2>{d.alsoAt.map((a, i) => <p key={i} className="also">{a}</p>)}</section>}
        <Signature d={d} className="left" />
        <div className="rxm-qrwrap"><Verify d={d} /></div>
      </aside>
      <main className="rxm-main">
        <section aria-label="Patient details">
          <div className="rxm-top"><p className="eyebrow">Prescription</p><p className="date">{d.blank ? (d.hand && d.hand.dateText ? d.hand.dateText : <span className="bl bl-date">&nbsp;</span>) : d.issuedText}</p></div>
          {d.blank && (
            <div className="rxm-blankpt">
              <p className="wide"><span>Patient</span><i /></p>
              <p><span>Age/Sex</span><i /></p>
              <p><span>Weight</span><i /></p>
              <p><span>Allergies</span><i /></p>
            </div>
          )}
          {clean(p.name) && <h2 className="rxm-name">{clean(p.name)}</h2>}
          {meta && <p className="rxm-meta">{meta}</p>}
          {clean(p.allergies) && <p className="rxm-pill"><span>Allergies:&nbsp;</span><strong>{clean(p.allergies)}</strong></p>}
          {clean(p.address) && <p className="rxm-meta">{clean(p.address)}</p>}
        </section>
        {d.vitals.length > 0 && (
          <section className="rxm-vitals" aria-label="Vitals">
            {d.vitals.map((v) => <div className="rxm-tile" key={v.k}><p className="l">{v.label}</p><p className="v">{v.value}<small> {v.unit}</small></p></div>)}
          </section>
        )}
        {pairs.length > 0 && <div className="rxm-two">{pairs}</div>}
        {d.show.meds && (
          <section aria-label="Medicines">
            <div className="rx-rxhead under"><span className="rx-glyph" aria-hidden="true">℞</span><span className="rx-label">Medicines</span></div>
            <DocMeds d={d} numClass="filled" />
          </section>
        )}
        <DocAdvice d={d} className="rx-advice round" />
      </main>
    </div>
  );
}

/* ---------- Templates 4–10: one flexible layout, different header, patient block, body and medicine style ---------- */
const FLEX = {
  banner: { header: 'band', patient: 'strip', body: 'single', meds: 'list', heads: 'caps', foot: 'band' },
  elegant: { header: 'centered', patient: 'lines', body: 'single', meds: 'list', heads: 'rule', foot: 'line', frame: true, watermark: true },
  minimal: { header: 'minimal', patient: 'inline', body: 'single', meds: 'list', heads: 'ink', foot: 'line', open: true },
  hospital: { header: 'clinicFirst', patient: 'grid', body: 'single', meds: 'table', heads: 'bar', foot: 'band' },
  split: { header: 'split', patient: 'strip', body: 'asideRight', meds: 'list', heads: 'caps', foot: 'line' },
  compact: { header: 'compact', patient: 'inline', body: 'asideLeft', meds: 'list', heads: 'caps', foot: 'line', dense: true },
  stripe: { header: 'stripe', patient: 'grid', body: 'single', meds: 'list', heads: 'bar', foot: 'line' },
};

function FlexHeader({ d, kind }) {
  const doc = d.doctor;
  const c = d.clinic;
  const docLines = (
    <>
      {doc.quals && <p className="q">{doc.quals}</p>}
      {(doc.title || doc.pmdc) && <p className="t">{[doc.title, doc.pmdc ? `PMDC Reg. No. ${doc.pmdc}` : ''].filter(Boolean).join(' · ')}</p>}
    </>
  );
  const clinicInline = d.hasClinic && (
    <div className="fxh-cline">
      {(c.name || c.address) && <span><IconPin size={13} /><span>{c.name && <strong>{c.name}</strong>}{c.name && c.address ? ', ' : ''}{c.address}</span></span>}
      {c.phone && <span><IconPhone size={13} />{c.phone}</span>}
      {c.timings && <span><IconClock size={13} />{c.timings}</span>}
    </div>
  );
  const clinicBlock = d.hasClinic && (
    <div className="fxh-cblock">
      {c.name && <p className="n">{c.name}</p>}
      {c.address && <p>{c.address}</p>}
      {c.phone && <p>{c.phone}</p>}
      {c.timings && <p>{c.timings}</p>}
    </div>
  );
  if (kind === 'band') {
    return <header className="fxh fxh-band"><div className="fxh-doc"><h1>{doc.name}</h1>{docLines}</div>{clinicBlock}</header>;
  }
  if (kind === 'centered') {
    return (
      <header className="fxh fxh-centered">
        <h1>{doc.name}</h1>{docLines}
        <div className="fxh-double" />
        {clinicInline}
      </header>
    );
  }
  if (kind === 'minimal') {
    return (
      <header className="fxh fxh-minimal">
        <div className="fxh-doc"><h1><span className="sq" aria-hidden="true" />{doc.name}</h1>{docLines}</div>
        {clinicBlock}
      </header>
    );
  }
  if (kind === 'clinicFirst') {
    return (
      <header className="fxh fxh-clinicfirst">
        {d.hasClinic && (
          <div className="fxh-top">
            {c.name && <p className="cn">{c.name}</p>}
            <p className="cl">{[c.address, c.phone, c.timings].filter(Boolean).join('  ·  ')}</p>
          </div>
        )}
        <div className="fxh-row">
          <div className="fxh-doc"><h1>{doc.name}</h1>{doc.quals && <p className="q">{doc.quals}</p>}</div>
          <div className="fxh-right">{doc.title && <p className="t">{doc.title}</p>}{doc.pmdc && <p className="t">PMDC Reg. No. {doc.pmdc}</p>}</div>
        </div>
      </header>
    );
  }
  if (kind === 'split') {
    return (
      <header className="fxh fxh-split">
        <div className="fxh-left"><span className="mark" aria-hidden="true">℞</span><div><h1>{doc.name}</h1>{docLines}</div></div>
        {clinicBlock || <div />}
      </header>
    );
  }
  if (kind === 'compact') {
    return (
      <header className="fxh fxh-compact">
        <div className="fxh-doc"><h1>{doc.name}</h1><p className="q">{[doc.quals, doc.title].filter(Boolean).join(' · ')}</p>{doc.pmdc && <p className="t">PMDC Reg. No. {doc.pmdc}</p>}</div>
        {d.hasClinic && <div className="fxh-cblock">{c.name && <p className="n">{c.name}</p>}<p>{[c.address, c.phone].filter(Boolean).join(' · ')}</p>{c.timings && <p>{c.timings}</p>}</div>}
      </header>
    );
  }
  /* stripe */
  return (
    <header className="fxh fxh-stripe">
      <div className="fxh-row">
        <div className="fxh-doc"><h1>{doc.name}</h1>{docLines}</div>
        <span className="ring" aria-hidden="true">℞</span>
      </div>
      {clinicInline}
    </header>
  );
}

function FlexPatient({ d, kind }) {
  const p = d.patient;
  if (kind === 'lines' && d.blank) {
    return <section className="rxb-pt fx-pt" aria-label="Patient details">{d.fields.map((f) => <p key={f.k} className={f.k === 'name' || f.k === 'date' ? 'wide' : ''}><span className="l">{f.label}</span><span className="v">{f.value}</span></p>)}</section>;
  }
  if (kind === 'lines') {
    const lines = [
      clean(p.name) && { k: 'name', l: 'Name', v: clean(p.name), wide: true },
      d.ageSex && { k: 'as', l: 'Age/Sex', v: d.ageSex },
      clean(p.weight) && { k: 'wt', l: 'Weight', v: `${clean(p.weight)} kg` },
      { k: 'date', l: 'Date', v: d.issuedText, wide: true },
      clean(p.allergies) && { k: 'al', l: 'Allergies', v: clean(p.allergies) },
      clean(p.phone) && { k: 'ph', l: 'Phone', v: maskPhone(p.phone) },
      clean(p.visit) && { k: 'vi', l: 'Visit', v: clean(p.visit) },
      clean(p.address) && { k: 'ad', l: 'Address', v: clean(p.address), wide: true },
    ].filter(Boolean);
    return <section className="rxb-pt fx-pt" aria-label="Patient details">{lines.map((x) => <p key={x.k} className={x.wide ? 'wide' : ''}><span className="l">{x.l}</span><span className="v">{x.v}</span></p>)}</section>;
  }
  if (kind === 'grid') {
    return (
      <section className="fx-ptgrid" aria-label="Patient details">
        {d.fields.map((f) => <div key={f.k} className={f.k === 'name' || f.k === 'address' || f.k === 'date' ? 'wide' : ''}><span>{f.label}</span><strong className={f.value ? '' : 'bl-cell'}>{f.value}</strong></div>)}
      </section>
    );
  }
  if (kind === 'inline') {
    return (
      <section className="fx-ptinline" aria-label="Patient details">
        {d.fields.map((f) => <span key={f.k}>{f.label} <strong className={f.value ? '' : `bl bl-${f.k}`}>{f.value}</strong></span>)}
      </section>
    );
  }
  return (
    <section className="rxc-pt fx-strip" aria-label="Patient details">
      {d.fields.map((f) => <p key={f.k}><span>{f.label} </span><strong className={f.value ? '' : `bl bl-${f.k}`}>{f.value}</strong></p>)}
    </section>
  );
}

function DocMedsTable({ d }) {
  return (
    <>
      <div className="rxb-grid rxb-th"><span>#</span><span>Medicine</span><span>Dose &amp; route</span><span>Frequency &amp; timing</span><span>Duration</span><span>Qty</span></div>
      {d.meds.map((m, i) => (
        <div className="rxb-med" key={m.id}>
          <div className="rxb-grid rxb-tr">
            <span className="num">{i + 1}</span>
            <div><p className="nm">{m.title}</p>{m.generic && <p className="gen">{m.generic}</p>}{m.note && <p className="gen">{m.note}</p>}</div>
            <span>{m.doseRoute}</span>
            <span>{m.freqTiming}</span>
            <span>{m.duration}</span>
            <span>{m.qty}</span>
          </div>
          {m.ur && <p className="ur rxb-ur" lang="ur"><b>ہدایت: </b>{m.ur}</p>}
        </div>
      ))}
    </>
  );
}

function FlexMeds({ d, cfg }) {
  if (!d.show.meds) return null;
  return (
    <section className="fx-meds" aria-label="Medicines">
      <div className={`rx-rxhead${cfg.meds === 'table' ? ' plain' : ''}`}><span className="rx-glyph" aria-hidden="true">℞</span><span className="rx-label">Medicines</span></div>
      {cfg.meds === 'table' ? <DocMedsTable d={d} /> : <DocMeds d={d} numClass={cfg.header === 'band' || cfg.header === 'split' ? 'filled' : ''} />}
    </section>
  );
}

function FlexClinical({ d, boxed }) {
  const parts = [];
  if (d.show.complaints || d.show.diagnosis) {
    parts.push(
      <section key="cd" className={boxed ? 'fx-box' : 'fx-sec'}>
        {d.show.complaints && <><h2 className="rx-h">Complaints</h2><TextOr d={d} v={d.complaints} n={2} /></>}
        {d.show.diagnosis && <><h2 className={`rx-h${d.show.complaints ? ' gap' : ''}`}>Diagnosis</h2><TextOr d={d} v={d.diagnosis} n={1} cls="rx-dx" /></>}
      </section>,
    );
  }
  if (d.vitals.length) {
    parts.push(
      <section key="v" className={boxed ? 'fx-box' : 'fx-sec'}>
        <h2 className="rx-h">Vitals</h2>
        <div className="rxb-vit">{d.vitals.map((v) => <p key={v.k}><span>{v.label}</span><span>{v.value} {v.unit}</span></p>)}</div>
      </section>,
    );
  }
  if (d.show.tests) {
    parts.push(<section key="t" className={boxed ? 'fx-box' : 'fx-sec'}><h2 className="rx-h">Tests advised</h2><ListOr d={d} items={d.tests} n={3} /></section>);
  }
  if (!parts.length) return null;
  return <div className={`fx-clin${boxed ? ' boxed' : ''}`}>{parts}</div>;
}

function FlexFollow({ d }) {
  if (!d.show.followUp) return null;
  return (
    <section className="fx-fu">
      <h2 className="rx-h">Follow-up</h2>
      <FollowOr d={d} />
    </section>
  );
}

function DocFlex({ d, tkey }) {
  const cfg = FLEX[tkey] || FLEX.banner;
  const cls = ['rx', 'rx-fx', `t-${tkey}`, `hd-${cfg.heads}`, cfg.dense ? 'dense' : '', cfg.open ? 'open' : '', d.blank ? 'is-blank' : ''].filter(Boolean).join(' ');
  const aside = cfg.body === 'asideRight' || cfg.body === 'asideLeft';
  const lower = d.advice.length > 0 || !!d.followUp;
  const inner = (
    <>
      {cfg.watermark && <span className="fx-wm" aria-hidden="true">℞</span>}
      <FlexHeader d={d} kind={cfg.header} />
      <div className="fx-pad"><FlexPatient d={d} kind={cfg.patient} /></div>
      {aside ? (
        <div className={`fx-body fx-aside-${cfg.body === 'asideLeft' ? 'left' : 'right'}`}>
          <main className="fx-main">
            <FlexMeds d={d} cfg={cfg} />
            <DocAdvice d={d} className="rx-advice" />
            <Signature d={d} />
          </main>
          <aside className="fx-side">
            {d.show.complaints && <section><h2 className="rx-h">Complaints</h2><TextOr d={d} v={d.complaints} n={3} /></section>}
            {d.vitals.length > 0 && <section><h2 className="rx-h">Vitals</h2><div className="rxc-vit">{d.vitals.map((v) => <p key={v.k}><span>{v.label}</span><span>{v.value} {v.unit}</span></p>)}</div></section>}
            {d.show.diagnosis && <section><h2 className="rx-h">Diagnosis</h2><TextOr d={d} v={d.diagnosis} n={2} cls="rx-dx" /></section>}
            {d.show.tests && <section><h2 className="rx-h">Tests advised</h2><ListOr d={d} items={d.tests} n={3} /></section>}
            <FlexFollow d={d} />
            <div className="fx-verify"><Verify d={d} /></div>
          </aside>
        </div>
      ) : (
        <div className="fx-body fx-single">
          <FlexClinical d={d} boxed={cfg.heads !== 'ink'} />
          <FlexMeds d={d} cfg={cfg} />
          {lower && (
            <div className={`fx-lower${d.advice.length && d.followUp ? '' : ' one'}`}>
              <DocAdvice d={d} className="rx-advice flat" />
              <FlexFollow d={d} />
            </div>
          )}
          <div className="fx-foot">
            <Verify d={d} inline />
            <Signature d={d} />
          </div>
        </div>
      )}
      {d.alsoAt.length > 0 && <footer className={`fx-also ${cfg.foot}`}>Also consults at {d.alsoAtText}</footer>}
    </>
  );
  return (
    <div className={cls} style={{ '--acc': d.accent, '--tint': d.tint, '--tint2': d.tint2 }}>
      {cfg.frame ? <div className="fx-frame">{inner}</div> : inner}
    </div>
  );
}

function RxDocument({ pad, rx }) {
  const d = buildDoc(pad, rx);
  if (pad.template === 'bilingual') return <DocBilingual d={d} />;
  if (pad.template === 'modern') return <DocModern d={d} />;
  if (FLEX[pad.template]) return <DocFlex d={d} tkey={pad.template} />;
  return <DocClassic d={d} />;
}

function ScaledDoc({ pad, rx, zoom }) {
  const wrap = useRef(null);
  const inner = useRef(null);
  const [w, setW] = useState(0);
  const [h, setH] = useState(1123);
  useEffect(() => {
    const measure = () => {
      if (wrap.current) setW(wrap.current.clientWidth);
      if (inner.current) setH(inner.current.offsetHeight);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(measure);
    if (wrap.current) ro.observe(wrap.current);
    if (inner.current) ro.observe(inner.current);
    return () => ro.disconnect();
  }, []);
  const s = zoom ? 1 : (w ? Math.min(1, w / 794) : 0.45);
  return (
    <div ref={wrap} className={`sdoc${zoom ? ' zoom' : ''}`} style={{ height: zoom ? h + 2 : Math.ceil(h * s) }}>
      <div ref={inner} className="sdoc-inner" style={{ transform: zoom ? 'none' : `scale(${s})` }}>
        <RxDocument pad={pad} rx={rx} />
      </div>
    </div>
  );
}

/* ================= Form controls ================= */
function Chip({ on, onClick, children, className = '', label }) {
  return (
    <button type="button" className={`chip ${className}${on ? ' on' : ''}`} aria-pressed={!!on} aria-label={label} onClick={onClick}>
      {children}
    </button>
  );
}
function Seg({ value, options, onChange, allowClear, label }) {
  return (
    <div className="chips" role="group" aria-label={label}>
      {options.map(([v, t]) => <Chip key={v} on={value === v} onClick={() => onChange(allowClear && value === v ? '' : v)}>{t}</Chip>)}
    </div>
  );
}
function Field({ id, label, required, missing, hint, children }) {
  return (
    <div className={`field${missing ? ' is-missing' : ''}`}>
      {id
        ? <label className="field-label" htmlFor={id}>{label}{required && <span className="req-star"> *</span>}</label>
        : <p className="field-label">{label}{required && <span className="req-star"> *</span>}</p>}
      {children}
      {hint && <p className="field-hint">{hint}</p>}
      {missing && <p className="field-err">Required. Fill this in to send.</p>}
    </div>
  );
}
function Sheet({ title, onClose, children, footer, closeLabel = 'Done' }) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') closeRef.current(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, []);
  return (
    <div className="sheet-wrap">
      <div className="sheet-backdrop" onClick={onClose} />
      <section className="sheet" role="dialog" aria-modal="true" aria-label={title}>
        <header className="sheet-head">
          <h2>{title}</h2>
          <button type="button" className="btn-text" onClick={onClose}>{closeLabel}</button>
        </header>
        <div className="sheet-body">{children}</div>
        {footer && <footer className="sheet-foot">{footer}</footer>}
      </section>
    </div>
  );
}

/* ================= Sheets ================= */
function PatientSheet({ rx, setPatient, showMissing, onClose }) {
  const p = rx.patient;
  const addAllergy = (a) => {
    if (a === 'None known') { setPatient('allergies', 'None known'); return; }
    const cur = clean(p.allergies);
    if (!cur || /^none/i.test(cur)) { setPatient('allergies', a); return; }
    if (cur.toLowerCase().includes(a.toLowerCase())) return;
    setPatient('allergies', `${cur}, ${a}`);
  };
  return (
    <Sheet title="Patient" onClose={onClose}>
      <Field id="pt-name" label="Name" required missing={showMissing && !clean(p.name)}>
        <input id="pt-name" className="inp" value={p.name} onChange={(e) => setPatient('name', e.target.value)} placeholder="Patient’s full name" autoComplete="off" />
      </Field>
      <Field id="pt-age" label="Age" required missing={showMissing && !clean(p.age)}>
        <div className="inline">
          <input id="pt-age" className="inp narrow" inputMode="decimal" value={p.age} onChange={(e) => setPatient('age', e.target.value.replace(/[^\d.]/g, ''))} placeholder="34" />
          <Seg label="Age unit" value={p.ageUnit} options={[['Y', 'Years'], ['M', 'Months'], ['D', 'Days']]} onChange={(v) => setPatient('ageUnit', v || 'Y')} />
        </div>
      </Field>
      <Field label="Sex" required missing={showMissing && !clean(p.sex)}>
        <Seg label="Sex" value={p.sex} options={[['Male', 'Male'], ['Female', 'Female'], ['Other', 'Other']]} onChange={(v) => setPatient('sex', v)} />
      </Field>
      <Field id="pt-weight" label="Weight (kg)" hint="Needed to check doses for children">
        <input id="pt-weight" className="inp narrow" inputMode="decimal" value={p.weight} onChange={(e) => setPatient('weight', e.target.value.replace(/[^\d.]/g, ''))} placeholder="72" />
      </Field>
      <Field id="pt-allergy" label="Allergies" hint="Medicines are checked against this. Try “Penicillin” with the example.">
        <input id="pt-allergy" className="inp" value={p.allergies} onChange={(e) => setPatient('allergies', e.target.value)} placeholder="e.g. Penicillin" autoComplete="off" />
        <div className="chips">
          {['None known', 'Penicillin', 'Sulfa', 'NSAIDs'].map((a) => <Chip key={a} on={clean(p.allergies).toLowerCase().includes(a.toLowerCase())} onClick={() => addAllergy(a)}>{a}</Chip>)}
        </div>
      </Field>
      <Field id="pt-phone" label="WhatsApp / phone" hint="Used to send the prescription">
        <input id="pt-phone" className="inp" type="tel" inputMode="tel" value={p.phone} onChange={(e) => setPatient('phone', e.target.value)} placeholder="03xx-xxxxxxx" autoComplete="off" />
      </Field>
      <Field label="Visit">
        <Seg label="Visit" allowClear value={p.visit} options={[['In-clinic', 'In-clinic'], ['Tele-consult', 'Tele-consult'], ['Home visit', 'Home visit']]} onChange={(v) => setPatient('visit', v)} />
      </Field>
      <Field id="pt-address" label="Address">
        <input id="pt-address" className="inp" value={p.address} onChange={(e) => setPatient('address', e.target.value)} placeholder="Optional" autoComplete="off" />
      </Field>
    </Sheet>
  );
}

function ComplaintsSheet({ value, onChange, onClose }) {
  const add = (c) => {
    const cur = clean(value);
    if (cur.toLowerCase().includes(c.toLowerCase())) return;
    onChange(cur ? `${cur.replace(/[.,\s]+$/, '')}, ${c.toLowerCase()}` : c);
  };
  return (
    <Sheet title="Complaints" onClose={onClose}>
      <Field id="rx-complaints" label="Presenting complaints">
        <textarea id="rx-complaints" className="inp" value={value} onChange={(e) => onChange(e.target.value)} placeholder="e.g. Fever and cough for 3 days" />
      </Field>
      <div className="chips">{COMPLAINT_PICKS.map((c) => <Chip key={c} onClick={() => add(c)}><IconPlus size={14} /> {c}</Chip>)}</div>
    </Sheet>
  );
}

function VitalsSheet({ v, setVital, onClose }) {
  const box = (k, label, unit, ph) => (
    <div className="vbox" key={k}>
      <label htmlFor={`vt-${k}`}>{label}</label>
      <div className="vin"><input id={`vt-${k}`} className="inp" inputMode="decimal" value={v[k]} onChange={(e) => setVital(k, e.target.value.replace(/[^\d.]/g, ''))} placeholder={ph} /><span>{unit}</span></div>
    </div>
  );
  return (
    <Sheet title="Vitals" onClose={onClose}>
      <p className="sheet-lead">Fill only what you measured. Empty ones are left off.</p>
      <div className="vbox">
        <label htmlFor="vt-bpSys">Blood pressure</label>
        <div className="vin">
          <input id="vt-bpSys" className="inp" inputMode="numeric" aria-label="Systolic" value={v.bpSys} onChange={(e) => setVital('bpSys', e.target.value.replace(/\D/g, ''))} placeholder="120" />
          <span className="slash">/</span>
          <input id="vt-bpDia" className="inp" inputMode="numeric" aria-label="Diastolic" value={v.bpDia} onChange={(e) => setVital('bpDia', e.target.value.replace(/\D/g, ''))} placeholder="80" />
          <span>mmHg</span>
        </div>
      </div>
      <div className="vgrid">
        {box('pulse', 'Pulse', '/min', '96')}
        {box('temp', 'Temperature', '°F', '98.6')}
        {box('spo2', 'SpO₂', '%', '98')}
        {box('rr', 'Resp. rate', '/min', '18')}
        {box('sugar', 'Blood sugar', 'mg/dL', '110')}
      </div>
    </Sheet>
  );
}

function DiagnosisSheet({ value, onChange, showMissing, onClose }) {
  return (
    <Sheet title="Diagnosis" onClose={onClose}>
      <Field id="rx-dx" label="Diagnosis" required missing={showMissing && !clean(value)}>
        <input id="rx-dx" className="inp" value={value} onChange={(e) => onChange(e.target.value)} placeholder="e.g. Acute tonsillopharyngitis" autoComplete="off" />
      </Field>
      <p className="field-label">Common</p>
      <div className="chips">{DIAGNOSIS_PICKS.map((d) => <Chip key={d} on={clean(value) === d} onClick={() => onChange(d)}>{d}</Chip>)}</div>
    </Sheet>
  );
}

function TestsSheet({ tests, onChange, onClose }) {
  const [custom, setCustom] = useState('');
  const toggle = (t) => onChange(tests.includes(t) ? tests.filter((x) => x !== t) : [...tests, t]);
  const add = () => { const t = clean(custom); if (t && !tests.includes(t)) onChange([...tests, t]); setCustom(''); };
  return (
    <Sheet title="Tests" onClose={onClose}>
      <p className="sheet-lead">Tap to order. Tap again to remove.</p>
      <div className="chips">{TEST_PICKS.map((t) => <Chip key={t} on={tests.includes(t)} onClick={() => toggle(t)}>{t}</Chip>)}</div>
      <Field id="rx-test-custom" label="Another test">
        <form className="inline" onSubmit={(e) => { e.preventDefault(); add(); }}>
          <input id="rx-test-custom" className="inp grow" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="e.g. Serum ferritin" autoComplete="off" />
          <button type="submit" className="btn">Add</button>
        </form>
      </Field>
      {tests.filter((t) => !TEST_PICKS.includes(t)).length > 0 && (
        <div className="chips">{tests.filter((t) => !TEST_PICKS.includes(t)).map((t) => <Chip key={t} on onClick={() => toggle(t)} label={`Remove ${t}`}>{t} <IconX size={14} /></Chip>)}</div>
      )}
    </Sheet>
  );
}

function AdviceSheet({ advice, onChange, onClose }) {
  const [custom, setCustom] = useState('');
  const toggle = (a) => onChange(advice.includes(a) ? advice.filter((x) => x !== a) : [...advice, a]);
  const add = () => { const t = clean(custom); if (t && !advice.includes(t)) onChange([...advice, t]); setCustom(''); };
  const customs = advice.filter((a) => !ADVICE_PICKS.some((x) => x.ur === a));
  return (
    <Sheet title="Advice" onClose={onClose}>
      <p className="sheet-lead">Advice prints in Urdu for the patient. Tap to add or remove.</p>
      <div className="adv-list">
        {ADVICE_PICKS.map((a) => (
          <button type="button" key={a.ur} className={`adv-opt${advice.includes(a.ur) ? ' on' : ''}`} aria-pressed={advice.includes(a.ur)} onClick={() => toggle(a.ur)}>
            <span className="adv-ur" lang="ur" dir="rtl">{a.ur}</span>
            <span className="adv-en">{a.en}</span>
            {advice.includes(a.ur) && <IconCheck className="adv-tick" />}
          </button>
        ))}
      </div>
      <Field id="rx-adv-custom" label="Write your own" hint="Type in Urdu or English">
        <form className="inline" onSubmit={(e) => { e.preventDefault(); add(); }}>
          <input id="rx-adv-custom" className="inp grow" dir="auto" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="ہدایت لکھیں" autoComplete="off" />
          <button type="submit" className="btn">Add</button>
        </form>
      </Field>
      {customs.length > 0 && <div className="chips">{customs.map((a) => <Chip key={a} on onClick={() => toggle(a)} label={`Remove ${a}`}><span dir="auto">{a}</span> <IconX size={14} /></Chip>)}</div>}
    </Sheet>
  );
}

function FollowSheet({ fu, base, onChange, onClose }) {
  const same = (x) => fu && fu.kind === 'after' && fu.n === x.n && fu.unit === x.unit;
  const label = (x) => `${x.n} ${x.n === 1 ? x.unit.replace(/s$/, '') : x.unit}`;
  const t = followText(fu, base);
  return (
    <Sheet title="Follow-up" onClose={onClose}>
      <div className="chips">
        {FOLLOW_PICKS.map((x) => <Chip key={label(x)} on={same(x)} onClick={() => onChange(same(x) ? null : { kind: 'after', ...x })}>After {label(x)}</Chip>)}
        <Chip on={fu && fu.kind === 'sos'} onClick={() => onChange(fu && fu.kind === 'sos' ? null : { kind: 'sos' })}>If not better</Chip>
      </div>
      <Field id="rx-fu-date" label="Or pick a date">
        <input id="rx-fu-date" className="inp narrow" type="date" value={fu && fu.kind === 'date' ? fu.date : ''} onChange={(e) => onChange(e.target.value ? { kind: 'date', date: e.target.value } : null)} />
      </Field>
      {t && <div className="live-line"><p className="ll-en">{t.en}</p><p className="ll-ur" lang="ur" dir="rtl">{t.ur}</p></div>}
      {fu && <button type="button" className="btn-text danger" onClick={() => onChange(null)}>Remove follow-up</button>}
    </Sheet>
  );
}

function MedSheet({ med, rx, memory = {}, onSave, onRemove, onClose }) {
  const isNew = !med;
  const [m, setM] = useState(() => (med ? { ...med } : newMed()));
  const [showSug, setShowSug] = useState(false);
  const [editUr, setEditUr] = useState(!!(med && med.urduEdited));
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [err, setErr] = useState('');
  const [filledFrom, setFilledFrom] = useState(null);
  const touched = useRef(!isNew);
  const f = FORMS[m.form] || FORMS.Tab;

  const set = (patch) => {
    if (Object.keys(patch).some((k) => !['name', 'strength', 'generic'].includes(k))) touched.current = true;
    setM((prev) => {
      const next = { ...prev, ...patch };
      if (patch.form && patch.form !== prev.form) {
        const nf = FORMS[patch.form];
        if (!('route' in patch)) next.route = nf.route;
        if (!('dose' in patch)) next.dose = nf.layer ? '' : nf.ml ? (nf.route === 'Gargle' ? '10' : '5') : '1';
        next.qtyAuto = true;
      }
      if (next.qtyAuto) next.qty = autoQty(next);
      return next;
    });
  };
  /* Fill every setting from the doctor's last use of this exact medicine and strength. */
  const recall = (entry, name) => {
    setM((prev) => {
      const next = { ...prev, ...settingsFrom(entry), name };
      next.qty = autoQty(next);
      return next;
    });
    setEditUr(!!entry.urduEdited);
    setFilledFrom(entry);
  };
  const base = baseName(m.name);
  const pick = (o) => {
    setShowSug(false);
    setErr('');
    const mem = o.mem || memory[medKey(o.label)];
    if (mem) { recall(mem, o.label); return; }
    setFilledFrom(null);
    set({ name: o.label, generic: o.generic, form: o.form, strength: '' });
  };
  const onType = (value) => {
    setErr('');
    setShowSug(true);
    const mem = memory[medKey(value)];
    if (mem && !touched.current) recall(mem, value);
    else { if (filledFrom && medKey(filledFrom.name) !== medKey(value)) setFilledFrom(null); set({ name: value, strength: '' }); }
  };
  const sugg = useMemo(() => {
    const t = baseName(m.name).toLowerCase();
    if (t.length < 2) return [];
    const typed = medKey(m.name);
    const mine = Object.values(memory)
      .filter((e) => matchesClue(e.name, t) || matchesClue(e.generic, t))
      .sort((a, b) => new Date(b.usedAt) - new Date(a.usedAt))
      .map((e) => ({ label: e.name, form: e.form, generic: clean(e.generic), mem: e }));
    const mineKeys = new Set(mine.map((o) => medKey(o.label)));
    const sample = [];
    DRUGS.filter((d) => matchesClue(d.name, t) || matchesClue(d.generic, t)).forEach((d) => {
      d.strengths.forEach((s) => {
        const label = `${d.name} ${s}`.trim();
        if (!mineKeys.has(medKey(label))) sample.push({ label, form: d.form, generic: d.generic });
      });
    });
    return [...mine, ...sample].filter((o) => medKey(o.label) !== typed).slice(0, 8);
  }, [m.name, memory]);
  const known = DRUGS.find((d) => d.name.toLowerCase() === base.toLowerCase() && d.form === m.form);
  const preview = useMemo(() => {
    const meds = isNew ? [...rx.meds, m] : rx.meds.map((x) => (x.id === m.id ? m : x));
    return checkRx({ ...rx, meds }).filter((a) => a.id === m.id);
  }, [m, rx, isNew]);
  const routeList = ROUTES.filter((r) => (m.route === r.k) || r.k !== 'Gargle' || m.form === 'Gargle');
  const save = () => {
    if (!clean(m.name)) { setErr('Write the medicine name first.'); return; }
    onSave(m);
  };
  const footer = (
    <>
      {!isNew && (confirmRemove
        ? <button type="button" className="btn danger" onClick={() => onRemove(m.id)}>Tap again to remove</button>
        : <button type="button" className="btn" onClick={() => setConfirmRemove(true)}>Remove</button>)}
      <button type="button" className="btn btn-primary" onClick={save}>{isNew ? 'Add to prescription' : 'Save changes'}</button>
    </>
  );
  return (
    <Sheet title={isNew ? 'Add medicine' : 'Edit medicine'} onClose={onClose} footer={footer} closeLabel="Cancel">
      <Field id="med-name" label="Medicine and strength" hint="Type the name and strength together, e.g. Flagyl 400 mg. Medicines you’ve prescribed before come first, with your last settings.">
        <div className="sug-wrap">
          <input id="med-name" className={`inp big${err ? ' bad' : ''}`} value={m.name} autoComplete="off"
            onChange={(e) => onType(e.target.value)}
            onFocus={() => setShowSug(true)} placeholder="e.g. Augmentin 1 g" />
          {showSug && sugg.length > 0 && (
            <div className="sug" role="listbox" aria-label="Suggestions">
              {sugg.map((o) => (
                <button type="button" role="option" aria-selected="false" key={`${o.label}-${o.form}`} className={`sug-opt${o.mem ? ' mine' : ''}`} onClick={() => pick(o)}>
                  <span className="sug-top"><strong>{o.label}</strong>{o.mem && <span className="mine-tag">Your usual</span>}</span>
                  {o.mem
                    ? <span>{enLine({ ...newMed(), ...settingsFrom(o.mem), name: o.label })}</span>
                    : <span>{(FORMS[o.form] || FORMS.Tab).label}{o.generic ? ` · ${o.generic}` : ' · generic'}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
        {err && <p className="field-err">{err}</p>}
        {filledFrom && (
          <p className="memo" role="status"><IconRepeat size={16} /><span>Filled with your last settings for <strong>{filledFrom.name}</strong> (used {fmtDate(new Date(filledFrom.usedAt))}). Change anything you need.</span></p>
        )}
        {known && known.strengths.filter(Boolean).length > 1 && (
          <div className="chips" role="group" aria-label="Other strengths">
            {known.strengths.map((s) => {
              const label = `${known.name} ${s}`;
              return <Chip key={s} on={clean(m.name).toLowerCase() === label.toLowerCase()} onClick={() => { setShowSug(false); const mem = memory[medKey(label)]; if (mem) recall(mem, label); else { setFilledFrom(null); set({ name: label, strength: '' }); } }}>{s}</Chip>;
            })}
          </div>
        )}
      </Field>

      <Field label="Form">
        <div className="chips scroll">{FORM_KEYS.map((k) => <Chip key={k} on={m.form === k} onClick={() => set({ form: k })}>{FORMS[k].label}</Chip>)}</div>
      </Field>

      <Field id="med-generic" label="Generic name (optional)">
        <input id="med-generic" className="inp" value={m.generic} onChange={(e) => set({ generic: e.target.value })} placeholder="e.g. Omeprazole" autoComplete="off" />
      </Field>

      {!f.layer && (
        <Field id="med-dose" label={`Dose${f.ml ? ' (ml)' : f.unit ? ` (${f.unit[1]})` : ''}`}>
          <div className="inline">
            {f.doses.map((x) => <Chip key={x} on={m.dose === x} onClick={() => set({ dose: x })}>{x}</Chip>)}
            <input id="med-dose" className="inp tiny" inputMode="decimal" aria-label="Other dose" value={f.doses.includes(m.dose) ? '' : m.dose} onChange={(e) => set({ dose: e.target.value.replace(/[^\d.½]/g, '') })} placeholder="Other" />
          </div>
        </Field>
      )}

      <Field label="Route">
        <div className="chips">{routeList.map((r) => <Chip key={r.k} on={m.route === r.k} onClick={() => set({ route: r.k })}>{r.en}</Chip>)}</div>
      </Field>

      <Field label="How often">
        <div className="chips">
          {FREQS.map((x) => (
            <Chip key={x.k} className="freq" on={m.freq === x.k} onClick={() => set({ freq: m.freq === x.k ? '' : x.k, sosMax: x.k === 'SOS' ? (m.sosMax || '3') : '' })}>
              <b>{x.k}</b><small>{x.en}</small>
            </Chip>
          ))}
        </div>
      </Field>
      {m.freq === 'SOS' && (
        <Field label="Not more than">
          <div className="chips">{['2', '3', '4', '6'].map((x) => <Chip key={x} on={m.sosMax === x} onClick={() => set({ sosMax: m.sosMax === x ? '' : x })}>{x} times a day</Chip>)}</div>
        </Field>
      )}

      <Field label="When">
        <div className="chips">{TIMINGS.map((t) => <Chip key={t.k} on={m.timing === t.k} onClick={() => set({ timing: m.timing === t.k ? '' : t.k })}>{t.en}</Chip>)}</div>
      </Field>

      <Field id="med-dur" label="For how long">
        <div className="inline">
          {['3', '5', '7', '10', '14'].map((x) => <Chip key={x} on={m.durU === 'days' && m.durN === x} onClick={() => set({ durN: x, durU: 'days' })}>{x} days</Chip>)}
        </div>
        <div className="inline">
          <input id="med-dur" className="inp tiny" inputMode="numeric" aria-label="Duration number" value={m.durU === 'continue' ? '' : m.durN} onChange={(e) => set({ durN: e.target.value.replace(/\D/g, ''), durU: m.durU === 'continue' ? 'days' : m.durU })} placeholder="0" />
          <Seg label="Duration unit" value={m.durU} options={[['days', 'Days'], ['weeks', 'Weeks'], ['months', 'Months'], ['continue', 'Continue']]} onChange={(v) => set({ durU: v || 'days' })} />
        </div>
      </Field>

      <div className="grid2">
        <Field id="med-qty" label="Quantity" hint={m.qtyAuto ? 'Worked out from dose and days' : 'Set by you'}>
          <input id="med-qty" className="inp" value={m.qty} onChange={(e) => set({ qty: e.target.value, qtyAuto: false })} placeholder="e.g. 10" autoComplete="off" />
        </Field>
        <Field id="med-note" label="Note (optional)">
          <input id="med-note" className="inp" value={m.note} onChange={(e) => set({ note: e.target.value })} placeholder="e.g. Stop if rash" autoComplete="off" />
        </Field>
      </div>

      <div className="live-line" aria-live="polite">
        <p className="ll-title">{medTitle(m) || 'Medicine'}{clean(m.generic) && <span className="muted"> ({clean(m.generic)})</span>}</p>
        <p className="ll-en">{enLine(m) || 'Choose dose, route and how often'}</p>
        {editUr ? (
          <>
            <label className="sr" htmlFor="med-urdu">Urdu instruction</label>
            <textarea id="med-urdu" className="inp ur-inp" dir="rtl" lang="ur" value={m.urduEdited ? m.urdu : urLine(m)} onChange={(e) => set({ urdu: e.target.value, urduEdited: true })} />
            <button type="button" className="btn-text" onClick={() => { set({ urdu: '', urduEdited: false }); setEditUr(false); }}>Use automatic Urdu</button>
          </>
        ) : (
          <>
            <p className="ll-ur" lang="ur" dir="rtl">{urLine(m)}</p>
            <button type="button" className="btn-text" onClick={() => setEditUr(true)}>Edit Urdu wording</button>
          </>
        )}
      </div>
      {preview.map((a, i) => <p className={`alert ${a.kind === 'info' ? 'soft' : ''}`} key={i}><IconAlert size={16} />{a.text}</p>)}
    </Sheet>
  );
}

function PadsSheet({ pads, padId, onPick, onManage, onClose }) {
  return (
    <Sheet title="Your pads" onClose={onClose}>
      <p className="sheet-lead">Pick the pad for this prescription. It opens by default next time.</p>
      <div className="pad-list">
        {pads.map((p) => (
          <button type="button" key={p.id} className={`pad-opt${p.id === padId ? ' on' : ''}`} aria-pressed={p.id === padId} onClick={() => onPick(p.id)}>
            <span className="pad-sw" style={{ background: p.accent }} aria-hidden="true">℞</span>
            <span className="pad-opt-body">
              <strong>{p.label}</strong>
              <span>{TEMPLATES[p.template].name} template · {p.clinic.name}</span>
              <span className="muted">{p.clinic.timings}</span>
            </span>
            {p.id === padId && <IconCheck />}
          </button>
        ))}
      </div>
      <button type="button" className="btn" onClick={onManage}><IconPen /> Pad settings</button>
    </Sheet>
  );
}

function ConfirmNewSheet({ onConfirm, onClose }) {
  return (
    <Sheet title="Start a new prescription?" onClose={onClose} closeLabel="Cancel"
      footer={<><button type="button" className="btn" onClick={onClose}>Keep editing</button><button type="button" className="btn btn-primary" onClick={onConfirm}>Clear and start new</button></>}>
      <p className="sheet-lead">This clears the patient and everything written on the current prescription. Your pad stays the same.</p>
    </Sheet>
  );
}

/* ================= Writing screen ================= */
function Row({ id, label, required, filled, missing, onClick, addText, children }) {
  return (
    <button type="button" id={id} className={`row${missing ? ' is-missing' : ''}`} onClick={onClick}>
      <span className="row-label">{label}{required && <span className="req-star" aria-hidden="true"> *</span>}</span>
      {filled ? <span className="row-body">{children}</span> : (
        <span className="row-empty">
          {required && <span className="req-tag">Required</span>}
          {!required && <IconPlus size={15} />} {addText}
        </span>
      )}
      <IconChevron className="row-go" />
    </button>
  );
}

function WriteScreen({ pad, rx, alerts, missing, showMissing, open, onPreview, onNew }) {
  const p = rx.patient;
  const miss = new Set(showMissing ? missing.map((x) => x.k) : []);
  const issued = new Date(rx.createdAt);
  const vit = vitalsList(rx.vitals);
  const fu = followText(rx.followUp, issued);
  const ptFilled = !!(clean(p.name) || clean(p.age) || clean(p.sex));
  const ptSub = [clean(p.age) ? `${clean(p.age)} ${p.ageUnit === 'Y' ? 'yrs' : p.ageUnit === 'M' ? 'months' : 'days'}` : '', clean(p.sex), clean(p.weight) ? `${clean(p.weight)} kg` : ''].filter(Boolean).join(' · ');
  const ptMore = [clean(p.phone), clean(p.visit), clean(p.address)].filter(Boolean).join(' · ');
  const meds = rx.meds;
  const alertsFor = (id) => alerts.filter((a) => a.id === id);
  return (
    <div className="writer">
      {rx.sentAt && (
        <p className="note edit-note"><IconPen size={16} /><span><strong>Editing a sent prescription.</strong> When you save, it shows “Edited*” with the date and time beside the QR code. Same Rx ID; the earlier version is kept.</span></p>
      )}
      {rx.prev && (
        <p className="note follow"><IconRepeat size={16} /><span><strong>Returning patient.</strong> Details filled from the visit on {fmtDate(new Date(rx.prev.date))}{rx.prev.diagnosis ? ` (${rx.prev.diagnosis})` : ''}. {rx.prev.count > 1 ? `${rx.prev.count} earlier visits.` : '1 earlier visit.'} Check age and weight.</span></p>
      )}
      {showMissing && missing.length > 0 && (
        <p className="missing" role="alert"><IconAlert size={16} /><span>Fill in {listText(missing.map((x) => x.t))} to continue.</span></p>
      )}
      <article className="pad" aria-label="Prescription pad">
        <header className="pad-head" style={{ background: pad.accent }}>
          <span className="ph-tpl">{TEMPLATES[pad.template].name}</span>
          <p className="ph-name">{pad.doctor.name}</p>
          <p className="ph-q">{degreesText(pad.doctor)}</p>
          <p className="ph-clinic">{pad.clinic.name} · {pad.clinic.timings}</p>
        </header>
        <div className="pad-meta">
          <span>{fmtDateTime(issued)} <span className="auto-tag">Auto</span></span>
          <span>{rx.id}</span>
        </div>
        <p className="pad-hint">Tap any part to fill it. Parts left empty are left off the final prescription.</p>

        <Row id="row-patient" label="Patient" required filled={ptFilled} missing={miss.has('name') || miss.has('age') || miss.has('sex')} onClick={() => open('patient')} addText="Add name, age and sex">
          <span className="row-main">{clean(p.name) || <span className="req-inline">Name missing</span>}</span>
          <span className="row-sub">{ptSub}{(!clean(p.age) || !clean(p.sex)) && <span className="req-inline">{ptSub ? ' · ' : ''}{!clean(p.age) && !clean(p.sex) ? 'Age and sex missing' : !clean(p.age) ? 'Age missing' : 'Sex missing'}</span>}</span>
          {clean(p.allergies) && <span className="row-sub">Allergies: {clean(p.allergies)}</span>}
          {ptMore && <span className="row-sub">{ptMore}</span>}
        </Row>
        <Row label="Complaints" filled={!!clean(rx.complaints)} onClick={() => open('complaints')} addText="Add complaints">
          <span className="row-text">{rx.complaints}</span>
        </Row>
        <Row label="Vitals" filled={vit.length > 0} onClick={() => open('vitals')} addText="Add vitals">
          <span className="vchips">{vit.map((x) => <span className="vchip" key={x.k}><small>{x.label}</small> {x.value}<small> {x.unit}</small></span>)}</span>
        </Row>
        <Row id="row-diagnosis" label="Diagnosis" required filled={!!clean(rx.diagnosis)} missing={miss.has('diagnosis')} onClick={() => open('diagnosis')} addText="Add diagnosis">
          <span className="row-main">{rx.diagnosis}</span>
        </Row>

        <section className="meds" aria-label="Medicines">
          <div className="meds-head">
            <span className="glyph" aria-hidden="true">℞</span>
            <span className="row-label">Medicines</span>
            {meds.length > 0 && <span className="count">{meds.length}</span>}
          </div>
          {meds.map((m, i) => (
            <button type="button" key={m.id} className="med" onClick={() => open('med', m.id)} aria-label={`Edit ${medTitle(m)}`}>
              <span className="med-n">{i + 1}</span>
              <span className="med-body">
                <span className="med-title">{medTitle(m)}{clean(m.generic) && <span className="med-gen"> ({clean(m.generic)})</span>}</span>
                <span className="med-en">{enLine(m)}{clean(m.qty) && <span className="med-qty"> · Qty {clean(m.qty)}</span>}</span>
                <span className="med-ur" lang="ur" dir="rtl">{urLine(m)}</span>
                {alertsFor(m.id).map((a, k) => <span key={k} className={`alert ${a.kind === 'info' ? 'soft' : ''}`}><IconAlert size={15} />{a.text}</span>)}
              </span>
            </button>
          ))}
          <button type="button" className="add-med" onClick={() => open('med')}><IconPlus size={18} /> Add medicine</button>
        </section>

        <Row label="Tests" filled={rx.tests.length > 0} onClick={() => open('tests')} addText="Add lab tests">
          <span className="tags">{rx.tests.map((t) => <span className="tag" key={t}>{t}</span>)}</span>
        </Row>
        <Row label="Advice" filled={rx.advice.length > 0} onClick={() => open('advice')} addText="Add advice">
          {rx.advice.map((a, i) => <span key={i} className="row-ur" dir="auto" lang="ur">• {a}</span>)}
        </Row>
        <Row label="Follow-up" filled={!!fu} onClick={() => open('follow')} addText="Add follow-up">
          {fu && <><span className="row-main">{fu.en}</span><span className="row-ur" lang="ur" dir="rtl">{fu.ur}</span></>}
        </Row>
      </article>

      <div className="actionbar">
        <button type="button" className="btn" onClick={onNew}>New</button>
        <button type="button" className="btn btn-primary" onClick={onPreview}>Preview &amp; send <IconChevron /></button>
      </div>
    </div>
  );
}

/* ================= Preview & send ================= */
function SendScreen({ pad, rx, alerts, title, subtitle, backLabel, onBack, saveState, onSave, onShared, onAddNumber, toast, children, before, after, bar }) {
  const msg = useMemo(() => buildMessage(pad, rx), [pad, rx]);
  const phone = clean(rx.patient.phone);
  const [showMsg, setShowMsg] = useState(false);
  const [zoom, setZoom] = useState(false);
  const ta = useRef(null);
  const copy = () => {
    const newlySaved = onShared ? onShared() : false;
    const fallback = () => {
      setShowMsg(true);
      setTimeout(() => { if (ta.current) { ta.current.focus(); ta.current.select(); } }, 60);
      toast(newlySaved ? 'Saved to My prescriptions. Copy is blocked here, so the text is selected for you.' : 'Copy is blocked here. The text is selected for you to copy.');
    };
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(msg).then(() => toast(newlySaved ? 'Copied and saved to My prescriptions' : 'Message copied'), fallback);
      } else fallback();
    } catch (e) { fallback(); }
  };
  const onWhatsApp = () => { if (onShared && onShared()) toast('Saved to My prescriptions'); };
  return (
    <div className={`pv${bar ? ' has-bar' : ''}`}>
      <div className="pv-top">
        <button type="button" className="btn" onClick={onBack}><IconBack /> {backLabel}</button>
        <div className="pv-title">
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      {before}
      {alerts.length > 0 && (
        <section className="alert-box" aria-label="Safety alerts">
          <h2><IconAlert size={18} /> {alerts.length} safety {alerts.length === 1 ? 'alert' : 'alerts'}</h2>
          <ul>{alerts.map((a, i) => <li key={i}>{a.text}</li>)}</ul>
          <p>Please review. You can still send the prescription.</p>
        </section>
      )}
      <div className="pv-grid">
        <div className="pv-doc">
          <div className="pv-docbar">
            <span>A4 · empty parts left off</span>
            <button type="button" className="btn-text" onClick={() => setZoom((z) => !z)}>{zoom ? 'Fit to screen' : 'Actual size'}</button>
          </div>
          <ScaledDoc key={`${rx.id}-${pad.template}-${zoom ? 'z' : 'f'}`} pad={pad} rx={rx} zoom={zoom} />
        </div>
        <section className="send" aria-labelledby="send-h">
          {saveState && (saveState === 'saved'
            ? <p className="saved-ok"><IconCheck /> Saved in My prescriptions</p>
            : <button type="button" className="btn btn-save" onClick={onSave}><IconFolder /> {saveState === 'changed' ? 'Save changes to My prescriptions' : 'Save to My prescriptions'}</button>)}
          <h2 id="send-h">Send to patient</h2>
          <p className="send-to">
            {phone ? <>To <strong>{phone}</strong></> : <>No number added. WhatsApp will ask who to send it to. </>}
            {!phone && onAddNumber && <button type="button" className="btn-text" onClick={onAddNumber}>Add number</button>}
          </p>
          <div className="send-grid">
            <a className="btn btn-primary" href={waLink(phone, msg)} target="_blank" rel="noopener noreferrer" onClick={onWhatsApp}><IconChat /> WhatsApp</a>
            <button type="button" className="btn" onClick={copy}><IconCopy /> Copy text</button>
          </div>
          <p className="field-hint">WhatsApp opens with the message ready. You press send there.{onShared ? ' Sending or copying also saves it to My prescriptions.' : ''}</p>
          <button type="button" className="btn-text left" aria-expanded={showMsg} onClick={() => setShowMsg((s) => !s)}>{showMsg ? 'Hide message text' : 'Show message text'}</button>
          {showMsg && <textarea ref={ta} id="msg-text" className="inp msgbox" readOnly value={msg} aria-label="Message text" />}
          <div className="later">
            <p>In the live app, also:</p>
            <div>{['PDF download', 'Print', 'SMS', 'Email', 'PakMed inbox', 'QR verification page'].map((x) => <span key={x}>{x}</span>)}</div>
          </div>
          {children}
        </section>
      </div>
      {after}
      {bar && <div className="view-bar" role="region" aria-label="Next prescription">{bar}</div>}
    </div>
  );
}

function DeleteSaved({ onDelete, onEdit, entry }) {
  const [confirmDel, setConfirmDel] = useState(false);
  return (
    <div className="saved-actions">
      {onEdit && (
        <>
          <button type="button" className="btn" onClick={onEdit}><IconPen /> Edit this prescription</button>
          <p className="field-hint">{entry && entry.sentAt ? 'Already sent: saving a change marks it “Edited*” with the date and time.' : 'Not sent yet: you can change it freely.'}{entry && entry.versions && entry.versions.length ? ` ${entry.versions.length} earlier ${entry.versions.length === 1 ? 'version' : 'versions'} kept.` : ''}</p>
        </>
      )}
      <button type="button" className={`btn${confirmDel ? ' danger' : ''}`} onClick={() => { if (!confirmDel) { setConfirmDel(true); return; } onDelete(); }}>
        <IconTrash /> {confirmDel ? 'Tap again to delete' : 'Delete from My prescriptions'}
      </button>
    </div>
  );
}

function VisitList({ visits, currentId, padOf, onOpen }) {
  const [all, setAll] = useState(false);
  if (visits.length < 2) return null;
  const curIdx = visits.findIndex((v) => v.id === currentId);
  const LIMIT = 4;
  const shown = all || visits.length <= LIMIT ? visits : visits.slice(0, Math.max(LIMIT, curIdx + 1));
  return (
    <section className="visits" aria-labelledby="visits-h">
      <div className="visits-head">
        <h2 id="visits-h">Visits</h2>
        <p>{visits.length} visits · latest first</p>
      </div>
      <ol className="vlist">
        {shown.map((v, i) => {
          const d = new Date(v.createdAt);
          const pd = padOf(v);
          const cur = v.id === currentId;
          const body = (
            <>
              <span className="v-date">{fmtDate(d)}</span>
              <span className="v-dx">{clean(v.diagnosis)}</span>
              {i === 0 && !cur && <span className="v-tag">Latest</span>}
              {cur ? <span className="v-cur">Viewing</span> : <IconChevron size={16} className="v-go" />}
            </>
          );
          return (
            <li key={v.id}>
              {cur
                ? <div className="vrow cur" aria-current="true" title={pd ? pd.label : ''}>{body}</div>
                : <button type="button" className="vrow" onClick={() => onOpen(v.id)} aria-label={`View visit of ${fmtDate(d)}, ${clean(v.diagnosis)}`}>{body}</button>}
            </li>
          );
        })}
      </ol>
      {!all && shown.length < visits.length && (
        <button type="button" className="btn-text left" onClick={() => setAll(true)}>Show all {visits.length} visits</button>
      )}
    </section>
  );
}

/* ================= My prescriptions folder ================= */
function FolderRow({ s, pad, visits = 1, onOpen }) {
  const d = new Date(s.createdAt);
  const p = s.patient;
  const meta = [clean(p.age) ? `${clean(p.age)} ${p.ageUnit}` : '', clean(p.sex)].filter(Boolean).join(' · ');
  const n = s.meds.filter((m) => clean(m.name)).length;
  return (
    <button type="button" className="frow" onClick={() => onOpen(s.id)}>
      <span className="frow-main">
        <span className="frow-name">{clean(p.name)}{meta && <span className="frow-meta"> · {meta}</span>}</span>
        <span className="frow-dx">{clean(s.diagnosis)}</span>
        <span className="frow-sub">
          {pad && <span className="dot" style={{ background: pad.accent }} aria-hidden="true" />}
          {pad ? pad.label : 'Pad removed'} · {n ? `${n} medicine${n > 1 ? 's' : ''}` : 'No medicines'}
          {visits > 1 && <span className="visit-tag">{visits} visits</span>}
          {s.editedAt && <span className="edit-tag">Edited*</span>}
          {s.example && <span className="ex-tag">Example</span>}
        </span>
      </span>
      <span className="frow-date"><strong>{fmtDate(d)}</strong><span>{fmtTime(d)}</span></span>
      <IconChevron className="frow-go" />
    </button>
  );
}

function FolderScreen({ saved, padOf, onOpen, onWrite }) {
  const [q, setQ] = useState('');
  const now = new Date();
  const list = useMemo(() => {
    const t = clean(q).toLowerCase();
    return [...saved]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .filter((s) => !t || `${s.patient.name} ${s.diagnosis} ${s.id}`.toLowerCase().includes(t));
  }, [saved, q]);
  const groups = [];
  list.forEach((s) => {
    const label = dayLabel(new Date(s.createdAt), now);
    let g = groups[groups.length - 1];
    if (!g || g.label !== label) { g = { label, items: [] }; groups.push(g); }
    g.items.push(s);
  });
  return (
    <div className="folder">
      <div className="folder-head">
        <div>
          <h1>My prescriptions</h1>
          <p>{saved.length} saved · newest first</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onWrite}><IconPen /> Write new</button>
      </div>
      {saved.length > 0 && (
        <div className="search">
          <IconSearch />
          <label className="sr" htmlFor="rx-search">Search prescriptions</label>
          <input id="rx-search" className="inp" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by patient or diagnosis" autoComplete="off" />
        </div>
      )}
      {saved.length === 0 && (
        <div className="empty">
          <IconFolder size={28} />
          <p><strong>No saved prescriptions yet.</strong></p>
          <p>Prescriptions you save or send appear here with the patient’s name, diagnosis and date.</p>
        </div>
      )}
      {saved.length > 0 && list.length === 0 && <p className="empty-line">No prescription matches “{clean(q)}”.</p>}
      {groups.map((g) => (
        <section key={g.label} className="fgroup" aria-label={g.label}>
          <h2>{g.label}</h2>
          <div className="flist">
            {g.items.map((s) => <FolderRow key={s.id} s={s} pad={padOf(s)} visits={visitsOf(saved, s.patient).length} onOpen={onOpen} />)}
          </div>
        </section>
      ))}
    </div>
  );
}

/* ================= Home ================= */
/* Opens straight onto the doctor's prescriptions: actions on top, the full searchable list below. */
function HomeScreen({ pad, pads, saved, padOf, draft, onWrite, onHand, onContinue, onFolder, onPads, onOpen }) {
  const [q, setQ] = useState('');
  const [range, setRange] = useState('all');
  const now = new Date();
  const sorted = useMemo(() => [...saved].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)), [saved]);
  const inRange = (s) => {
    const age = (now - new Date(s.createdAt)) / 86400000;
    if (range === 'today') return dayLabel(new Date(s.createdAt), now) === 'Today';
    if (range === 'week') return age <= 7;
    if (range === 'month') return age <= 31;
    return true;
  };
  const t = clean(q).toLowerCase();
  const list = sorted.filter((s) => inRange(s) && (!t || `${s.patient.name} ${s.diagnosis} ${s.id}`.toLowerCase().includes(t)));
  const today = saved.filter((s) => dayLabel(new Date(s.createdAt), now) === 'Today').length;
  const week = saved.filter((s) => (now - new Date(s.createdAt)) / 86400000 <= 7).length;
  const patients = new Set(saved.map((s) => clean(s.patient.name).toLowerCase()).filter(Boolean)).size;
  const RANGES = [['all', 'All'], ['today', 'Today'], ['week', 'This week'], ['month', 'This month']];
  return (
    <div className="home">
      <div className="hm-head">
        <div className="hm-title">
          <h1>{PROFILE.name}</h1>
          <p>
            <span className="dot" style={{ background: pad.accent }} aria-hidden="true" />
            Writing on <strong>{pad.label}</strong> · PMDC {PROFILE.pmdc}
          </p>
        </div>
        <div className="hm-actions">
          <button type="button" className="btn sm" onClick={onPads}><IconPads size={18} /> Pad settings</button>
          <button type="button" className="btn sm" onClick={onHand}><IconPrint size={18} /> Blank pad</button>
          <button type="button" className="btn sm btn-primary" onClick={onWrite}><IconPlus size={18} /> New prescription</button>
        </div>
      </div>

      {draft && (
        <button type="button" className="draft-banner" onClick={onContinue}>
          <IconPen size={18} />
          <span><strong>Unsaved prescription{clean(draft.patient.name) ? ` for ${clean(draft.patient.name)}` : ''}</strong><small>Continue writing</small></span>
          <IconChevron />
        </button>
      )}

      <div className="hm-stats">
        <div className="hm-stat"><span>Total</span><strong>{saved.length}</strong></div>
        <div className="hm-stat"><span>Today</span><strong>{today}</strong></div>
        <div className="hm-stat"><span>Last 7 days</span><strong>{week}</strong></div>
        <div className="hm-stat"><span>Patients</span><strong>{patients}</strong></div>
      </div>

      <section className="hm-card" aria-labelledby="rx-list-h">
        <div className="hm-card-head">
          <h2 id="rx-list-h">Prescriptions</h2>
          <div className="hm-tools">
            <div className="search">
              <IconSearch />
              <label className="sr" htmlFor="rx-home-search">Search prescriptions</label>
              <input id="rx-home-search" className="inp" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search patient, diagnosis or Rx ID" autoComplete="off" />
            </div>
            <div className="hm-range" role="tablist" aria-label="Date range">
              {RANGES.map(([k, l]) => (
                <button key={k} type="button" role="tab" aria-selected={range === k} className={range === k ? 'on' : ''} onClick={() => setRange(k)}>{l}</button>
              ))}
            </div>
          </div>
        </div>

        {saved.length === 0 ? (
          <div className="hm-empty">
            <IconFolder size={28} />
            <p><strong>No prescriptions yet</strong></p>
            <p>Prescriptions you save or send appear here, newest first.</p>
            <button type="button" className="btn sm btn-primary" onClick={onWrite}><IconPlus size={18} /> New prescription</button>
          </div>
        ) : list.length === 0 ? (
          <p className="hm-none">No prescription matches{t ? ` “${clean(q)}”` : ' this range'}.</p>
        ) : (
          <div className="hm-table" role="table" aria-label="Prescriptions">
            <div className="hm-tr hm-th" role="row">
              <span role="columnheader">Patient</span>
              <span role="columnheader">Diagnosis</span>
              <span role="columnheader">Pad</span>
              <span role="columnheader">Medicines</span>
              <span role="columnheader">Date</span>
              <span aria-hidden="true" />
            </div>
            {list.map((s) => {
              const d = new Date(s.createdAt);
              const p = s.patient;
              const pd = padOf(s);
              const meta = [clean(p.age) ? `${clean(p.age)} ${p.ageUnit}` : '', clean(p.sex)].filter(Boolean).join(' · ');
              const n = s.meds.filter((m) => clean(m.name)).length;
              const visits = visitsOf(saved, s.patient).length;
              const initials = clean(p.name).split(/\s+/).map((w) => w[0]).slice(0, 2).join('').toUpperCase() || 'P';
              return (
                <button key={s.id} type="button" className="hm-tr" role="row" onClick={() => onOpen(s.id)} aria-label={`Open prescription for ${clean(p.name)}`}>
                  <span className="hm-pt" role="cell">
                    <span className="hm-av" aria-hidden="true">{initials}</span>
                    <span className="hm-pt-text">
                      <strong>{clean(p.name)}</strong>
                      <small>{meta}{visits > 1 && <span className="visit-tag">{visits} visits</span>}</small>
                    </span>
                  </span>
                  <span className="hm-dx" role="cell">
                    {clean(s.diagnosis) || '—'}
                    {s.editedAt && <span className="edit-tag">Edited*</span>}
                  </span>
                  <span className="hm-pad" role="cell">
                    {pd && <span className="dot" style={{ background: pd.accent }} aria-hidden="true" />}
                    {pd ? pd.label : 'Pad removed'}
                  </span>
                  <span className="hm-meds" role="cell">{n ? `${n} medicine${n > 1 ? 's' : ''}` : 'None'}</span>
                  <span className="hm-date" role="cell"><strong>{fmtDate(d)}</strong><small>{fmtTime(d)}</small></span>
                  <IconChevron className="hm-go" />
                </button>
              );
            })}
          </div>
        )}
        {saved.length > 0 && (
          <div className="hm-foot">
            <span>Showing {list.length} of {saved.length}</span>
            <button type="button" className="btn-text" onClick={onFolder}>Open folder view</button>
          </div>
        )}
      </section>
    </div>
  );
}

/* ================= Pads: list and editor ================= */
const PADS_KEY = 'pakmed-rxpad-pads-v2';
const OLD_PADS_KEY = 'pakmed-rxpad-pads-v1';
function loadPads() {
  const raw = store.get(PADS_KEY);
  if (raw) {
    try {
      const v = JSON.parse(raw);
      if (Array.isArray(v) && v.length) return v.filter((p) => p && p.id && p.doctor && p.clinic).map(livePad);
    } catch (e) { /* fall back to samples */ }
  }
  /* Keep pads the doctor made in the earlier prototype; replace the old example pads with the new ones. */
  let kept = [];
  const old = store.get(OLD_PADS_KEY);
  if (old) {
    try { const v = JSON.parse(old); if (Array.isArray(v)) kept = v.filter((p) => p && p.id && p.doctor && p.clinic && !OLD_SAMPLE_PAD_IDS.includes(p.id)); } catch (e) { /* ignore */ }
  }
  return [...JSON.parse(JSON.stringify(SAMPLE_PADS)), ...kept].map(livePad);
}
function blankPad(from, pads) {
  const used = new Set(pads.map((p) => p.accent));
  const free = ACCENTS.find(([c]) => !used.has(c));
  const doc = from ? from.doctor : {};
  return {
    id: `pad-${uid()}`, label: '', template: 'classic', accent: free ? free[0] : ACCENTS[0][0],
    doctor: {
      name: PROFILE.name, nameUr: doc.nameUr || PROFILE.nameUr || '', degrees: Array.isArray(doc.degrees) && doc.degrees.length ? [...doc.degrees] : [...PROFILE.degrees], qualsUr: doc.qualsUr || '',
      title: doc.title || '', titleUr: doc.titleUr || '', pmdc: PROFILE.pmdc, signature: doc.signature || '', signatureImg: doc.signatureImg || '',
    },
    clinic: { name: '', address: '', phone: '', timings: '' },
    alsoAt: [],
  };
}
function readSignature(file, onDone, onErr) {
  if (!file || !/^image\//.test(file.type)) { onErr('Choose a photo or image file.'); return; }
  const fr = new FileReader();
  fr.onerror = () => onErr('That file could not be read. Try another photo.');
  fr.onload = () => {
    const img = new Image();
    img.onerror = () => onErr('That image could not be opened. Try another photo.');
    img.onload = () => {
      const scale = Math.min(1, 600 / img.width, 240 / img.height);
      const c = document.createElement('canvas');
      c.width = Math.max(1, Math.round(img.width * scale));
      c.height = Math.max(1, Math.round(img.height * scale));
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      try { onDone(c.toDataURL('image/png')); } catch (e) { onDone(String(fr.result)); }
    };
    img.src = String(fr.result);
  };
  fr.readAsDataURL(file);
}

/* Full-screen look at a template or pad before choosing it. Swipe or use the arrows to move between them. */
function PadViewer({ items, index, onIndex, onClose, children }) {
  const it = items[Math.min(index, items.length - 1)];
  const [zoom, setZoom] = useState(false);
  const touch = useRef(null);
  const stage = useRef(null);
  const ref = useRef({ index, onIndex, onClose, n: items.length });
  ref.current = { index, onIndex, onClose, n: items.length };
  useEffect(() => {
    const onKey = (e) => {
      const r = ref.current;
      if (e.key === 'Escape') r.onClose();
      else if (e.key === 'ArrowRight' && r.index < r.n - 1) r.onIndex(r.index + 1);
      else if (e.key === 'ArrowLeft' && r.index > 0) r.onIndex(r.index - 1);
    };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
  }, []);
  useEffect(() => { if (stage.current) stage.current.scrollTo(0, 0); }, [index]);
  const go = (n) => { if (n >= 0 && n < items.length) onIndex(n); };
  const onTouchStart = (e) => { if (!zoom && e.touches.length === 1) touch.current = { x: e.touches[0].clientX, y: e.touches[0].clientY }; };
  const onTouchEnd = (e) => {
    const t = touch.current;
    touch.current = null;
    if (!t || zoom) return;
    const dx = e.changedTouches[0].clientX - t.x;
    const dy = e.changedTouches[0].clientY - t.y;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(index + (dx < 0 ? 1 : -1));
  };
  return (
    <div className="viewer" role="dialog" aria-modal="true" aria-label={it.title}>
      <header className="viewer-top">
        <button type="button" className="icon-btn" onClick={onClose} aria-label="Close full screen"><IconX /></button>
        <div className="viewer-title">
          <strong>{it.title}</strong>
          {it.subtitle && <small>{it.subtitle}</small>}
        </div>
        <button type="button" className="btn sm" aria-pressed={zoom} onClick={() => setZoom((z) => !z)}>{zoom ? 'Fit' : 'Zoom'}</button>
      </header>
      <div className={`viewer-stage${zoom ? ' zoomed' : ''}`} ref={stage} onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}>
        {items.length > 1 && <button type="button" className="viewer-nav prev" onClick={() => go(index - 1)} disabled={index === 0} aria-label="Previous"><IconBack size={22} /></button>}
        <div className="viewer-doc">
          <ScaledDoc key={`${it.key}-${zoom ? 'z' : 'f'}`} pad={it.pad} rx={it.rx || BLANK_RX} zoom={zoom} />
        </div>
        {items.length > 1 && <button type="button" className="viewer-nav next" onClick={() => go(index + 1)} disabled={index === items.length - 1} aria-label="Next"><IconChevron size={22} /></button>}
      </div>
      <footer className="viewer-bar">
        {items.length > 1 && (
          <div className="viewer-dots" aria-hidden="true">
            {items.map((x, i) => <span key={x.key} className={i === index ? 'on' : ''} />)}
          </div>
        )}
        {children}
      </footer>
    </div>
  );
}

function PadsScreen({ pads, padId, onUse, onEdit, onDuplicate, onDelete, onNew }) {
  const [confirmId, setConfirmId] = useState(null);
  const [viewAt, setViewAt] = useState(null);
  const items = pads.map((p) => ({
    key: p.id, pad: p, title: p.label,
    subtitle: `${TEMPLATES[p.template] ? TEMPLATES[p.template].name : 'Classic'} template${p.id === padId ? ' · in use' : ''}`,
  }));
  const cur = viewAt != null ? pads[Math.min(viewAt, pads.length - 1)] : null;
  return (
    <div className="folder">
      <div className="folder-head">
        <div>
          <h1>Pad settings</h1>
          <p>{pads.length} saved · the pad in use opens by default</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={onNew}><IconPlus /> New pad</button>
      </div>
      <p className="sheet-lead">Make one pad for each place you practise. Tap a pad’s picture to see it full screen.</p>
      <div className="pad-cards">
        {pads.map((p, i) => (
          <article key={p.id} className={`pad-card${p.id === padId ? ' on' : ''}`} aria-label={p.label}>
            <button type="button" className="pc-thumb" onClick={() => setViewAt(i)} aria-label={`View ${p.label} full screen`}>
              <ScaledDoc pad={p} rx={BLANK_RX} />
            </button>
            <div className="pc-body">
              <div className="pc-title"><h2>{p.label}</h2>{p.id === padId && <span className="in-use">In use</span>}</div>
              <p>{TEMPLATES[p.template] ? TEMPLATES[p.template].name : 'Classic'} template</p>
              <p className="muted">{[p.clinic.name, p.clinic.timings].filter(Boolean).join(' · ') || 'No clinic details yet'}</p>
            </div>
            <div className="pc-actions">
                {p.id !== padId && <button type="button" className="btn sm btn-use" onClick={() => onUse(p.id)}>Use this pad</button>}
                <button type="button" className="btn sm" onClick={() => onEdit(p.id)}>Edit</button>
                <button type="button" className="btn sm" onClick={() => onDuplicate(p.id)}>Duplicate</button>
                {pads.length > 1 && (confirmId === p.id
                  ? <button type="button" className="btn sm danger" onClick={() => { setConfirmId(null); onDelete(p.id); }}><IconTrash size={16} /> Tap again to delete</button>
                  : <button type="button" className="btn sm" onClick={() => setConfirmId(p.id)} aria-label={`Delete ${p.label}`}><IconTrash size={16} /> Delete</button>)}
              </div>
            {confirmId === p.id && (
              <p className="field-hint pc-confirm">Prescriptions already written on this pad keep their letterhead. <button type="button" className="btn-text inline" onClick={() => setConfirmId(null)}>Keep pad</button></p>
            )}
          </article>
        ))}
      </div>
      {pads.length === 1 && <p className="field-hint">You need at least one pad, so your only pad can’t be deleted.</p>}
      {cur && (
        <PadViewer items={items} index={Math.min(viewAt, pads.length - 1)} onIndex={setViewAt} onClose={() => setViewAt(null)}>
          <div className="viewer-actions">
            {cur.id === padId
              ? <p className="viewer-note"><IconCheck size={16} /> In use</p>
              : <button type="button" className="btn btn-primary" onClick={() => { onUse(cur.id); setViewAt(null); }}>Use this pad</button>}
            <button type="button" className="btn" onClick={() => { const id = cur.id; setViewAt(null); onEdit(id); }}>Edit</button>
          </div>
        </PadViewer>
      )}
    </div>
  );
}

function PadEditor({ initial, isNew, canDelete, onSave, onCancel, onDuplicate, onDelete }) {
  const [p, setP] = useState(() => livePad(JSON.parse(JSON.stringify(initial))));
  const [degreeDraft, setDegreeDraft] = useState('');
  const [tried, setTried] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [tplView, setTplView] = useState(null);
  const [confirmDel, setConfirmDel] = useState(false);
  const [sigErr, setSigErr] = useState('');
  const setTop = (k, v) => setP((x) => ({ ...x, [k]: v }));
  const setDoc = (k, v) => setP((x) => ({ ...x, doctor: { ...x.doctor, [k]: v } }));
  const setClinic = (k, v) => setP((x) => ({ ...x, clinic: { ...x.clinic, [k]: v } }));
  const degrees = p.doctor.degrees || [];
  const setDegrees = (list) => setDoc('degrees', list);
  const addDegree = (v) => {
    const t = clean(v);
    if (!t) return;
    if (!degrees.some((x) => clean(x).toLowerCase() === t.toLowerCase())) setDegrees([...degrees, t]);
    setDegreeDraft('');
  };
  const moveDegree = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= degrees.length) return;
    const list = [...degrees];
    [list[i], list[j]] = [list[j], list[i]];
    setDegrees(list);
  };
  const alsoAt = p.alsoAt || [];
  const setAlso = (i, k, v) => setTop('alsoAt', alsoAt.map((a, n) => (n === i ? { ...a, [k]: v } : a)));
  const miss = { label: !clean(p.label), name: false, pmdc: false };
  const save = () => {
    const first = ['label', 'name', 'pmdc'].find((k) => miss[k]);
    if (first) {
      setTried(true);
      const el = document.getElementById({ label: 'pad-label', name: 'pad-doc-name', pmdc: 'pad-pmdc' }[first]);
      if (el) { el.scrollIntoView({ behavior: 'smooth', block: 'center' }); el.focus({ preventScroll: true }); }
      return;
    }
    onSave({
      ...livePad(p), label: clean(p.label),
      doctor: { ...p.doctor, degrees: degrees.map(clean).filter(Boolean) },
      alsoAt: alsoAt.filter((a) => clean(a.name) || clean(a.timings)),
    });
  };
  const onFile = (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    setSigErr('');
    readSignature(file, (url) => setDoc('signatureImg', url), setSigErr);
  };
  const txt = (id, label, value, onChange, opts = {}) => (
    <Field id={id} label={label} required={opts.required} missing={opts.missing} hint={opts.hint}>
      <input id={id} className={`inp${opts.ur ? ' ur-field' : ''}`} dir={opts.ur ? 'rtl' : undefined} lang={opts.ur ? 'ur' : undefined}
        value={value} onChange={(e) => onChange(e.target.value)} placeholder={opts.ph || ''} autoComplete="off" />
    </Field>
  );
  return (
    <div className="pe">
      <div className="pv-top">
        <button type="button" className="btn" onClick={onCancel}><IconBack /> Pad settings</button>
        <div className="pv-title">
          <h1>{isNew ? 'New pad' : 'Edit pad'}</h1>
          <p>{isNew ? 'Pick a template, then add your details. Empty details are left off the pad.' : clean(initial.label)}</p>
        </div>
      </div>
      {tried && (miss.label || miss.name || miss.pmdc) && (
        <p className="missing" role="alert"><IconAlert size={16} /><span>Fill in {listText([miss.label && 'pad name', miss.name && 'doctor’s name', miss.pmdc && 'PMDC number'].filter(Boolean))} to save.</span></p>
      )}
      <div className="pe-grid">
        <div className="pe-form">
          <section className="pe-sec" aria-labelledby="pe-h1">
            <h2 id="pe-h1">1. Template</h2>
            <p className="field-hint">{TEMPLATE_KEYS.length} designs. Tap one to see it full screen, then choose it.</p>
            <div className="tpl-grid" role="group" aria-label="Templates">
              {TEMPLATE_KEYS.map((k, i) => (
                <button type="button" key={k} className={`tpl-opt${p.template === k ? ' on' : ''}`} aria-label={`${TEMPLATES[k].name}${p.template === k ? ', chosen' : ''}. View full screen`} onClick={() => setTplView(i)}>
                  <span className="tpl-thumb" aria-hidden="true"><ScaledDoc pad={withPlaceholders({ ...p, template: k })} rx={BLANK_RX} /></span>
                  <span className="tpl-name">{p.template === k && <IconCheck size={16} />}{i + 1}. {TEMPLATES[k].name}</span>
                </button>
              ))}
            </div>
            <p className="tpl-chosen"><strong>{TEMPLATES[p.template].name}:</strong> {TEMPLATES[p.template].desc}</p>
            <Field label="Colour">
              <div className="swatches" role="group" aria-label="Colour">
                {ACCENTS.map(([c, n]) => (
                  <button type="button" key={c} className={`swatch${p.accent === c ? ' on' : ''}`} style={{ background: c }} aria-pressed={p.accent === c} aria-label={n} onClick={() => setTop('accent', c)}>
                    {p.accent === c && <IconCheck size={18} />}
                  </button>
                ))}
              </div>
            </Field>
          </section>

          <section className="pe-sec" aria-labelledby="pe-h2">
            <h2 id="pe-h2">2. Pad name</h2>
            {txt('pad-label', 'Pad name', p.label, (v) => setTop('label', v), { required: true, missing: tried && miss.label, ph: 'e.g. Evening clinic', hint: 'Only you see this. It helps you pick the right pad.' })}
          </section>

          <section className="pe-sec" aria-labelledby="pe-h3">
            <h2 id="pe-h3">3. Doctor</h2>
            <div className="locked" aria-label="From your PakMed profile">
              <p className="locked-head"><IconLock size={15} /> From your verified PakMed profile</p>
              <div className="locked-grid">
                <p><small>Name</small><strong>{PROFILE.name}</strong></p>
                <p><small>PMDC registration</small><strong>{PROFILE.pmdc}</strong></p>
              </div>
              <p className="field-hint">These are printed on every pad and can’t be changed here, so each prescription carries the right doctor. To change them, update your Doctor profile.</p>
            </div>
            <div className="field">
              <p className="field-label">Qualifications</p>
              {degrees.length > 0 && (
                <ol className="deg-list">
                  {degrees.map((g, i) => (
                    <li key={i} className="deg-row">
                      <label className="sr" htmlFor={`deg-${i}`}>Qualification {i + 1}</label>
                      <input id={`deg-${i}`} className="inp" value={g} onChange={(e) => setDegrees(degrees.map((x, n) => (n === i ? e.target.value : x)))} autoComplete="off" />
                      <button type="button" className="icon-btn" aria-label={`Move ${clean(g) || 'qualification'} up`} disabled={i === 0} onClick={() => moveDegree(i, -1)}><IconUp size={16} /></button>
                      <button type="button" className="icon-btn" aria-label={`Remove ${clean(g) || 'qualification'}`} onClick={() => setDegrees(degrees.filter((_, n) => n !== i))}><IconX size={16} /></button>
                    </li>
                  ))}
                </ol>
              )}
              <form className="inline" onSubmit={(e) => { e.preventDefault(); addDegree(degreeDraft); }}>
                <label className="sr" htmlFor="deg-new">Add a qualification</label>
                <input id="deg-new" className="inp grow" value={degreeDraft} onChange={(e) => setDegreeDraft(e.target.value)} placeholder="e.g. FCPS (Medicine), MRCP (UK)" autoComplete="off" />
                <button type="submit" className="btn sm">Add</button>
              </form>
              <div className="chips">
                {DEGREE_PICKS.filter((g) => !degrees.some((x) => clean(x).toLowerCase().startsWith(g.toLowerCase()))).map((g) => (
                  <Chip key={g} onClick={() => addDegree(g)}><IconPlus size={14} /> {g}</Chip>
                ))}
              </div>
              <p className="field-hint">Filled from your profile. Add as many as you like; type the speciality in brackets if needed, e.g. FCPS (Paediatrics). Printed in this order.</p>
            </div>
            {txt('pad-title', 'Designation', p.doctor.title, (v) => setDoc('title', v), { ph: 'e.g. Consultant Physician' })}
            {TEMPLATES[p.template].urdu ? (
              <div className="ur-group">
                <p className="field-label">In Urdu, for the Bilingual template</p>
                {txt('pad-name-ur', 'Name in Urdu', p.doctor.nameUr, (v) => setDoc('nameUr', v), { ur: true, ph: 'ڈاکٹر کا نام' })}
                {txt('pad-quals-ur', 'Qualifications in Urdu', p.doctor.qualsUr, (v) => setDoc('qualsUr', v), { ur: true, ph: 'ایم بی بی ایس' })}
                {txt('pad-title-ur', 'Designation in Urdu', p.doctor.titleUr, (v) => setDoc('titleUr', v), { ur: true, ph: 'کنسلٹنٹ' })}
              </div>
            ) : (
              <p className="field-hint">Choose the Bilingual template to add your name and qualifications in Urdu.</p>
            )}
          </section>

          <section className="pe-sec" aria-labelledby="pe-h4">
            <h2 id="pe-h4">4. Clinic or hospital</h2>
            {txt('pad-clinic', 'Name', p.clinic.name, (v) => setClinic('name', v), { ph: 'e.g. Iqbal Family Clinic' })}
            {txt('pad-address', 'Address', p.clinic.address, (v) => setClinic('address', v), { ph: 'Street, area, city' })}
            <div className="grid2">
              {txt('pad-phone', 'Phone', p.clinic.phone, (v) => setClinic('phone', v), { ph: '0300-0000000' })}
              {txt('pad-timings', 'Timings', p.clinic.timings, (v) => setClinic('timings', v), { ph: 'Mon–Sat · 5–9 pm' })}
            </div>
          </section>

          <section className="pe-sec" aria-labelledby="pe-h4b">
            <h2 id="pe-h4b">5. Also consults at</h2>
            <p className="field-hint">Other hospitals or clinics where you see patients. Printed on the pad so patients can find you there.</p>
            {alsoAt.map((a, i) => (
              <div className="also-row" key={i}>
                <div className="also-head">
                  <p className="field-label">Place {i + 1}</p>
                  <button type="button" className="btn-text danger" onClick={() => setTop('alsoAt', alsoAt.filter((_, n) => n !== i))}>Remove</button>
                </div>
                <label className="sr" htmlFor={`also-name-${i}`}>Hospital or clinic, area</label>
                <input id={`also-name-${i}`} className="inp" value={a.name} onChange={(e) => setAlso(i, 'name', e.target.value)} placeholder="Hospital or clinic, area" autoComplete="off" />
                <label className="sr" htmlFor={`also-time-${i}`}>Days and timings</label>
                <input id={`also-time-${i}`} className="inp" value={a.timings} onChange={(e) => setAlso(i, 'timings', e.target.value)} placeholder="Days and timings, e.g. Mon, Wed · 10 am–1 pm" autoComplete="off" />
              </div>
            ))}
            {alsoAt.length < 6 && <button type="button" className="btn add-row" onClick={() => setTop('alsoAt', [...alsoAt, { name: '', timings: '' }])}><IconPlus /> {alsoAt.length ? 'Add another place' : 'Add a hospital or clinic'}</button>}
          </section>

          <section className="pe-sec" aria-labelledby="pe-h5">
            <h2 id="pe-h5">6. Signature</h2>
            <div className="sig-box">
              <div className="sig-prev" aria-label="Signature preview">
                {p.doctor.signatureImg
                  ? <img src={p.doctor.signatureImg} alt="Your signature" />
                  : <span className="sig-txt">{clean(p.doctor.signature) || clean(p.doctor.name).replace(/^Dr\.?\s*/, '') || 'Signature'}</span>}
              </div>
              <div className="sig-actions">
                <input id="sig-file" className="file-inp" type="file" accept="image/*" onChange={onFile} />
                <label htmlFor="sig-file" className="btn sm">{p.doctor.signatureImg ? 'Change photo' : 'Upload signature or stamp'}</label>
                {p.doctor.signatureImg && <button type="button" className="btn-text danger" onClick={() => setDoc('signatureImg', '')}>Remove photo</button>}
              </div>
            </div>
            {sigErr && <p className="field-err">{sigErr}</p>}
            {!p.doctor.signatureImg && txt('pad-sig', 'Or type your signature', p.doctor.signature, (v) => setDoc('signature', v), { ph: clean(p.doctor.name).replace(/^Dr\.?\s*/, '') || 'Your name' })}
            <p className="field-hint">A photo of your signature on white paper works best. It stays on this pad only.</p>
          </section>

          {!isNew && (
            <section className="pe-sec quiet" aria-label="More actions">
              <button type="button" className="btn" onClick={() => onDuplicate(p)}><IconCopy /> Duplicate this pad</button>
              {canDelete
                ? <button type="button" className={`btn${confirmDel ? ' danger' : ''}`} onClick={() => { if (!confirmDel) { setConfirmDel(true); return; } onDelete(p.id); }}><IconTrash /> {confirmDel ? 'Tap again to delete this pad' : 'Delete pad'}</button>
                : <p className="field-hint">This is your only pad, so it can’t be deleted.</p>}
              <p className="field-hint">Prescriptions already issued keep the letterhead they were written on.</p>
            </section>
          )}
        </div>
        <aside className="pe-live" aria-label="Pad preview">
          <p className="live-h">Preview <span>A4 · {TEMPLATES[p.template].name} · blank pad</span></p>
          <ScaledDoc key={p.template} pad={p} rx={BLANK_RX} />
        </aside>
      </div>
      <div className="pe-bar">
        <button type="button" className="btn pe-prev" onClick={() => setShowPreview(true)}>Preview</button>
        <button type="button" className="btn btn-primary" onClick={save}>{isNew ? 'Save pad' : 'Save changes'}</button>
      </div>
      {showPreview && (
        <PadViewer items={[{ key: 'me', pad: p, title: clean(p.label) || 'New pad', subtitle: `${TEMPLATES[p.template].name} template · blank pad` }]}
          index={0} onIndex={() => {}} onClose={() => setShowPreview(false)}>
          <div className="viewer-actions"><button type="button" className="btn btn-primary" onClick={() => setShowPreview(false)}>Back to editing</button></div>
        </PadViewer>
      )}
      {tplView != null && (() => {
        const k = TEMPLATE_KEYS[tplView];
        const items = TEMPLATE_KEYS.map((key, i) => ({
          key, pad: withPlaceholders({ ...p, template: key }), title: `${i + 1}. ${TEMPLATES[key].name}`, subtitle: TEMPLATES[key].desc,
        }));
        return (
          <PadViewer items={items} index={tplView} onIndex={setTplView} onClose={() => setTplView(null)}>
            <div className="viewer-swatches" role="group" aria-label="Colour">
              {ACCENTS.map(([c, n]) => (
                <button type="button" key={c} className={`swatch sm${p.accent === c ? ' on' : ''}`} style={{ background: c }} aria-pressed={p.accent === c} aria-label={n} onClick={() => setTop('accent', c)}>
                  {p.accent === c && <IconCheck size={14} />}
                </button>
              ))}
            </div>
            <div className="viewer-actions">
              {p.template === k
                ? <button type="button" className="btn btn-primary" onClick={() => setTplView(null)}><IconCheck /> Chosen · back to details</button>
                : <button type="button" className="btn btn-primary" onClick={() => { setTop('template', k); setTplView(null); }}>Choose {TEMPLATES[k].name}</button>}
            </div>
          </PadViewer>
        );
      })()}
    </div>
  );
}

/* ================= Hand-written prescription sheets ================= */
const escHtml = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
function handRx({ qr, dated, boxes, sheetNo, at }) {
  const id = `PM-HW-${String(at.getFullYear()).slice(2)}${String(at.getMonth() + 1).padStart(2, '0')}-${sheetNo}`;
  return {
    ...blankRx(), id, createdAt: at.toISOString(), blank: true,
    hand: { qr, boxes, sheetId: id, printedText: fmtDate(at), dateText: dated ? fmtDate(at) : '' },
  };
}
/* Renders the sheets off screen and wraps them in a self-contained A4 file that opens the print window. */
function buildHandHtml(pad, rxs) {
  const host = document.createElement('div');
  host.setAttribute('aria-hidden', 'true');
  host.style.cssText = 'position:fixed;left:-30000px;top:0;width:794px;pointer-events:none;';
  document.body.appendChild(host);
  const root = ReactDOM.createRoot(host);
  ReactDOM.flushSync(() => root.render(<>{rxs.map((r) => <div className="print-sheet" key={r.id}><RxDocument pad={pad} rx={r} /></div>)}</>));
  const sheets = host.innerHTML;
  root.unmount();
  host.remove();
  const cssEl = document.getElementById('app-css');
  const fontEl = document.getElementById('app-fonts');
  const css = cssEl ? cssEl.textContent : '';
  const fonts = fontEl ? fontEl.getAttribute('href') : '';
  const n = rxs.length;
  const label = `${n} hand-written prescription ${n === 1 ? 'sheet' : 'sheets'} · ${pad.label} · A4`;
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>Hand-written prescription · ${escHtml(pad.label)}</title>
${fonts ? `<link rel="stylesheet" href="${escHtml(fonts)}">` : ''}
<style>${css}</style>
<style>
@page { size: A4; margin: 0; }
html, body { margin: 0; padding: 0; height: auto; background: #dfe5e4; color: #1b1f23; color-scheme: light; }
body { -webkit-print-color-adjust: exact; print-color-adjust: exact; font-family: 'Source Sans 3', 'Segoe UI', sans-serif; }
.bar { position: sticky; top: 0; z-index: 2; display: flex; flex-wrap: wrap; align-items: center; justify-content: space-between; gap: 10px; padding: 12px 16px; background: #0d5c57; color: #ffffff; font-size: 15px; }
.bar button { min-height: 44px; padding: 0 22px; border: 0; border-radius: 10px; background: #ffffff; color: #0d5c57; font: inherit; font-weight: 700; cursor: pointer; }
.bar small { display: block; opacity: 0.85; }
.print-sheets { display: flex; flex-direction: column; align-items: center; gap: 24px; padding: 24px 0 40px; overflow-x: auto; }
.print-sheet { width: 794px; height: 1123px; overflow: hidden; flex-shrink: 0; background: #ffffff; box-shadow: 0 2px 14px rgba(0, 0, 0, 0.18); }
.print-sheet .rx { height: 1123px; min-height: 0; }
@media print {
  html, body { background: #ffffff; }
  .bar { display: none; }
  .print-sheets { display: block; padding: 0; overflow: visible; }
  .print-sheet { box-shadow: none; break-after: page; page-break-after: always; }
  .print-sheet:last-child { break-after: auto; page-break-after: auto; }
}
</style></head><body>
<div class="bar"><span>${escHtml(label)}<small>Print on A4 with margins set to none. Turn on background graphics so colours print.</small></span><button type="button" onclick="window.print()">Print</button></div>
<div class="print-sheets">${sheets}</div>
<script>
window.addEventListener('load', function () {
  var go = function () { setTimeout(function () { window.print(); }, 500); };
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
});
<\/script>
</body></html>`;
}
let downloadsPromise = null;
function getDownloads() {
  if (!downloadsPromise) {
    const c = typeof window !== 'undefined' ? window.claude : null;
    downloadsPromise = c && typeof c.use === 'function' ? Promise.resolve(c.use('downloads')).catch(() => null) : Promise.resolve(null);
  }
  return downloadsPromise;
}
const slug = (s) => clean(s).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pad';

function HandScreen({ pads, padId, toast }) {
  const [hpId, setHpId] = useState(padId);
  const pad = pads.find((p) => p.id === hpId) || pads[0];
  const [qr, setQr] = useState(true);
  const [dated, setDated] = useState(false);
  const [boxes, setBoxes] = useState(true);
  const [copies, setCopies] = useState(1);
  const [view, setView] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [baseNo] = useState(() => 1000 + Math.floor(Math.random() * 8000));
  const [at] = useState(() => new Date());
  const preview = useMemo(() => handRx({ qr, dated, boxes, sheetNo: baseNo, at }), [qr, dated, boxes, baseNo, at]);
  useEffect(() => { getDownloads(); }, []);
  const lastNo = baseNo + copies - 1;
  const idOf = (no) => handRx({ qr, dated, boxes, sheetNo: no, at }).id;
  const download = async () => {
    setBusy(true);
    setMsg(null);
    try {
      const rxs = Array.from({ length: copies }, (_, i) => handRx({ qr, dated, boxes, sheetNo: baseNo + i, at }));
      const html = buildHandHtml(pad, rxs);
      const dl = await getDownloads();
      const filename = `hand-written-rx-${slug(pad.label)}-${fmtDate(at).toLowerCase().replace(/\s+/g, '-')}.html`;
      if (!dl) {
        /* Opened as a plain file in a browser: open the print file in a new tab, or download it if pop-ups are blocked. */
        try {
          const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
          const win = window.open(url, '_blank');
          if (win) {
            setMsg({ kind: 'ok', text: 'The print file opened in a new tab. Choose A4, margins “None”, and turn on background graphics.' });
          } else {
            const a = document.createElement('a');
            a.href = url; a.download = filename;
            document.body.appendChild(a); a.click(); a.remove();
            setMsg({ kind: 'ok', text: 'Downloaded. Open the file and your print window appears. Choose A4, margins “None”, and turn on background graphics.' });
          }
          setTimeout(() => URL.revokeObjectURL(url), 60000);
        } catch (e) {
          setMsg({ kind: 'err', text: 'Saving files isn’t available in this view. In the live app this button prints or saves a PDF directly.' });
        }
        return;
      }
      const res = await dl.save({ filename, data: html });
      if (res && res.status === 'delivered') toast('File sent');
      else setMsg({ kind: 'ok', text: 'Saved. Open the file and your print window appears. Choose A4, margins “None”, and turn on background graphics.' });
    } catch (e) {
      const code = e && e.code;
      if (code === 'declined') setMsg({ kind: 'info', text: 'Not saved. Tap the button again when you’re ready.' });
      else if (code === 'rate_limited') setMsg({ kind: 'info', text: 'A save window is already open. Finish it, then try again.' });
      else if (code === 'rejected_extension' || code === 'extension_not_enabled') setMsg({ kind: 'err', text: 'This view can’t save print files. In the live app this button prints or saves a PDF directly.' });
      else setMsg({ kind: 'err', text: 'The file couldn’t be saved here. In the live app this button prints or saves a PDF directly.' });
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="hand">
      <div className="hand-head">
        <h1>Hand-written prescription</h1>
        <p>Print blank sheets with your letterhead and write on them by hand, as you do now.</p>
      </div>
      <div className="hand-grid">
        <div className="hand-preview">
          <button type="button" className="pc-thumb" onClick={() => setView(true)} aria-label="View the sheet full screen">
            <ScaledDoc key={`${pad.id}-${pad.template}`} pad={pad} rx={preview} />
          </button>
          <p className="field-hint">Tap the sheet to see it full screen.</p>
        </div>
        <div className="hand-opts">
          <section className="pe-sec" aria-labelledby="h-pad">
            <h2 id="h-pad">Pad</h2>
            <div className="chips" role="group" aria-label="Pad">
              {pads.map((p) => (
                <Chip key={p.id} on={p.id === pad.id} onClick={() => setHpId(p.id)}>
                  <span className="dot" style={{ background: p.accent }} aria-hidden="true" /> {p.label}
                </Chip>
              ))}
            </div>
          </section>
          <section className="pe-sec" aria-labelledby="h-opt">
            <h2 id="h-opt">On the sheet</h2>
            <Field label="QR code" hint="Shows your name, qualifications, PMDC number, clinic, the sheet number and the print date when scanned.">
              <Seg label="QR code" value={qr ? 'on' : 'off'} options={[['on', 'With QR code'], ['off', 'No QR code']]} onChange={(v) => setQr(v !== 'off')} />
            </Field>
            <Field label="Date">
              <Seg label="Date" value={dated ? 'today' : 'hand'} options={[['hand', 'Write by hand'], ['today', `Print ${fmtDate(at)}`]]} onChange={(v) => setDated(v === 'today')} />
            </Field>
            <Field label="Note boxes" hint="Plain gives the most room to write medicines.">
              <Seg label="Note boxes" value={boxes ? 'on' : 'off'} options={[['on', 'Complaints, vitals, diagnosis, tests'], ['off', 'Plain ℞ space']]} onChange={(v) => setBoxes(v !== 'off')} />
            </Field>
            <Field label="Number of sheets" hint={qr ? `Each sheet gets its own number: ${idOf(baseNo)}${copies > 1 ? ` to ${idOf(lastNo)}` : ''}.` : 'One page per sheet in the file.'}>
              <div className="chips" role="group" aria-label="Number of sheets">
                {[1, 5, 10, 25].map((n) => <Chip key={n} on={copies === n} onClick={() => setCopies(n)}>{n}</Chip>)}
              </div>
            </Field>
          </section>
          <p className="note sign-note"><IconPen size={16} /><span><strong>Sheets print unsigned.</strong> Sign and stamp each one by hand when you write it, so a blank signed sheet can’t be misused.</span></p>
          <div className="hand-action">
            <button type="button" className="btn btn-primary big" onClick={download} disabled={busy}>
              <IconPrint /> {busy ? 'Preparing…' : `Download ${copies} ${copies === 1 ? 'sheet' : 'sheets'} to print`}
            </button>
            <p className="field-hint">You get an A4 print file. Open it and the print window appears.</p>
            {msg && <p className={`hand-msg ${msg.kind}`} role="status">{msg.text}</p>}
            <div className="later">
              <p>In the live app, also:</p>
              <div>{['Print directly', 'PDF', 'Sheet numbers checked by pharmacies'].map((x) => <span key={x}>{x}</span>)}</div>
            </div>
          </div>
        </div>
      </div>
      {view && (
        <PadViewer items={[{ key: 'hand', pad, rx: preview, title: 'Hand-written sheet', subtitle: `${pad.label} · ${TEMPLATES[pad.template].name} template` }]}
          index={0} onIndex={() => {}} onClose={() => setView(false)}>
          <div className="viewer-actions"><button type="button" className="btn btn-primary" onClick={() => setView(false)}>Back</button></div>
        </PadViewer>
      )}
    </div>
  );
}

/* ================= App ================= */
function DiscardSheet({ name, onDiscard, onClose }) {
  return (
    <Sheet title="Unsaved prescription" onClose={onClose} closeLabel="Cancel"
      footer={<><button type="button" className="btn" onClick={onClose}>Keep it</button><button type="button" className="btn btn-primary danger-fill" onClick={onDiscard}>Discard and continue</button></>}>
      <p className="sheet-lead">The prescription you were writing{name ? ` for ${name}` : ''} isn’t saved yet. Continuing will clear it.</p>
    </Sheet>
  );
}

const SCREEN_TITLES = { hand: 'Hand-written', write: 'Write new', preview: 'Ready to send', folder: 'My prescriptions', view: 'Prescription', pads: 'Pad settings', padEdit: 'Edit pad' };

function App({ onExit }) {
  const [pads, setPads] = useState(loadPads);
  const [padId, setPadId] = useState(() => {
    const s = store.get(LAST_PAD_KEY);
    return pads.some((p) => p.id === s) ? s : pads[0].id;
  });
  const pad = pads.find((p) => p.id === padId) || pads[0];
  const [rx, setRx] = useState(blankRx);
  const [saved, setSaved] = useState(loadSaved);
  const [memory, setMemory] = useState(() => loadMemory(saved));
  const [screen, setScreen] = useState('home'); // home | write | preview | folder | view | pads | padEdit
  const [viewId, setViewId] = useState(null);
  const [editing, setEditing] = useState(null); // { pad, isNew }
  const [sheet, setSheet] = useState(null);
  const [pending, setPending] = useState(null);
  const [showMissing, setShowMissing] = useState(false);
  const [toastText, setToastText] = useState('');

  const alerts = useMemo(() => checkRx(rx), [rx]);
  const missing = useMemo(() => missingFields(rx), [rx]);
  const savedEntry = saved.find((s) => s.id === rx.id);
  const saveState = !savedEntry ? 'new' : (rxCore(savedEntry) === rxCore(rx) && savedEntry.padId === pad.id ? 'saved' : 'changed');
  const viewEntry = screen === 'view' ? saved.find((s) => s.id === viewId) : null;
  const padOf = (s) => (s.padSnapshot ? normalizePad(s.padSnapshot) : pads.find((p) => p.id === s.padId) || null);
  const viewPad = viewEntry ? (padOf(viewEntry) || pad) : pad;
  const viewAlerts = useMemo(() => (viewEntry ? checkRx(viewEntry) : []), [viewEntry]);
  const viewVisits = useMemo(() => (viewEntry ? visitsOf(saved, viewEntry.patient) : []), [viewEntry, saved]);
  const draftHasContent = !!(clean(rx.patient.name) || clean(rx.diagnosis) || rx.meds.length || clean(rx.complaints) || rx.tests.length || rx.advice.length);
  const draftDirty = draftHasContent && saveState !== 'saved';

  useEffect(() => { store.set(LAST_PAD_KEY, padId); }, [padId]);
  useEffect(() => { store.set(SAVED_KEY, JSON.stringify(saved)); }, [saved]);
  useEffect(() => { store.set(PADS_KEY, JSON.stringify(pads)); }, [pads]);
  useEffect(() => { store.set(MEDS_KEY, JSON.stringify(memory)); }, [memory]);
  useEffect(() => {
    if (!toastText) return undefined;
    const t = setTimeout(() => setToastText(''), 3000);
    return () => clearTimeout(t);
  }, [toastText]);

  const toTop = () => window.scrollTo(0, 0);
  const go = (s) => { setScreen(s); toTop(); };
  const update = (fn) => setRx((prev) => fn(prev));
  const setPatient = (k, v) => update((r) => ({ ...r, patient: { ...r.patient, [k]: v } }));
  const setVital = (k, v) => update((r) => ({ ...r, vitals: { ...r.vitals, [k]: v } }));
  const open = (type, id) => setSheet({ type, id });
  const close = () => setSheet(null);
  /* Anything that would replace an unsaved prescription asks first. */
  const guard = (fn) => {
    if (draftDirty) { setPending(() => fn); open('discard'); return; }
    fn();
  };

  const goPreview = () => {
    if (missing.length) {
      setShowMissing(true);
      const target = document.getElementById(['name', 'age', 'sex'].includes(missing[0].k) ? 'row-patient' : 'row-diagnosis');
      if (target && target.scrollIntoView) target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setShowMissing(false);
    go('preview');
  };
  const begin = (next) => { setRx(next); setShowMissing(false); setSheet(null); go('write'); };
  const startNew = () => begin(blankRx());
  const writeNew = () => guard(startNew);
  const saveCurrent = (opts = {}) => {
    const now = new Date().toISOString();
    const prev = saved.find((x) => x.id === rx.id);
    const entry = { ...JSON.parse(JSON.stringify(rx)), sample: false, example: false, padId: pad.id, padSnapshot: JSON.parse(JSON.stringify(pad)), savedAt: now };
    delete entry.versions;
    entry.versions = prev && prev.versions ? prev.versions : [];
    entry.sentAt = (prev && prev.sentAt) || rx.sentAt || (opts.sent ? now : null);
    entry.editedAt = (prev && prev.editedAt) || null;
    /* A change saved after the prescription was sent: stamp it and keep the earlier version. */
    if (prev && prev.sentAt && (rxCore(prev) !== rxCore(entry) || prev.padId !== entry.padId)) {
      const old = JSON.parse(JSON.stringify(prev));
      delete old.versions;
      entry.versions = [...entry.versions, old];
      entry.editedAt = now;
    }
    update((r) => ({ ...r, sentAt: entry.sentAt, editedAt: entry.editedAt, versions: entry.versions }));
    if (!clean(entry.patient.pid)) {
      const match = saved.find((s) => samePatient(s.patient, entry.patient));
      entry.patient.pid = match && clean(match.patient.pid) ? match.patient.pid : `pt-${uid()}`;
      update((r) => ({ ...r, patient: { ...r.patient, pid: entry.patient.pid } }));
    }
    setSaved((list) => [entry, ...list.filter((s) => s.id !== rx.id)]);
    setMemory((mem) => rememberMeds(mem, rx.meds, entry.savedAt));
  };
  const onSave = () => { saveCurrent(); setToastText('Saved to My prescriptions'); };
  const onShared = () => {
    if (saveState === 'saved') {
      if (savedEntry && !savedEntry.sentAt) {
        const now = new Date().toISOString();
        setSaved((list) => list.map((x) => (x.id === rx.id ? { ...x, sentAt: now } : x)));
        update((r) => ({ ...r, sentAt: now }));
      }
      return false;
    }
    saveCurrent({ sent: true });
    return true;
  };
  const editSaved = (entry) => guard(() => {
    const copy = JSON.parse(JSON.stringify(entry));
    delete copy.example; delete copy.padSnapshot;
    if (copy.padId && copy.padId !== padId && pads.some((p0) => p0.id === copy.padId)) setPadId(copy.padId);
    begin({ ...copy, sample: false });
    setToastText(entry.sentAt ? 'Editing. Saving will mark it Edited*' : 'Editing');
  });
  const openSaved = (id) => { setViewId(id); go('view'); };
  const deleteSaved = (id) => { setSaved((l) => l.filter((s) => s.id !== id)); go('folder'); setToastText('Prescription deleted'); };
  const writeForPatient = (entry) => guard(() => {
    begin(newForPatient(entry, saved));
    setToastText(`Patient details filled for ${clean(entry.patient.name)}`);
  });
  const repeatSaved = (entry) => guard(() => {
    begin(repeatRx(entry, saved));
    setToastText('Copied into a new prescription. Check it before sending.');
  });
  const saveMed = (m) => {
    update((r) => {
      const exists = r.meds.some((x) => x.id === m.id);
      return { ...r, meds: exists ? r.meds.map((x) => (x.id === m.id ? m : x)) : [...r.meds, m] };
    });
    close();
  };
  const removeMed = (id) => { update((r) => ({ ...r, meds: r.meds.filter((x) => x.id !== id) })); close(); };

  /* Pads */
  const pickPad = (id) => { setPadId(id); setToastText(`Using “${(pads.find((p) => p.id === id) || {}).label}”`); };
  const newPad = () => { setEditing({ pad: blankPad(pad, pads), isNew: true }); go('padEdit'); };
  const editPad = (id) => { const src = pads.find((p) => p.id === id); if (src) { setEditing({ pad: src, isNew: false }); go('padEdit'); } };
  const duplicatePad = (src) => {
    const copy = { ...JSON.parse(JSON.stringify(livePad(src))), id: `pad-${uid()}`, label: `${clean(src.label)} (copy)` };
    setEditing({ pad: copy, isNew: true });
    go('padEdit');
    setToastText('Copy made. Change what’s different, then save.');
  };
  const savePad = (pd) => {
    const exists = pads.some((p) => p.id === pd.id);
    setPads((list) => (exists ? list.map((p) => (p.id === pd.id ? pd : p)) : [...list, pd]));
    if (!exists) { setPadId(pd.id); setToastText(`“${pd.label}” saved and in use`); } else setToastText('Pad saved');
    setEditing(null);
    go('pads');
  };
  const deletePad = (id) => {
    if (pads.length <= 1) return;
    const rest = pads.filter((p) => p.id !== id);
    setPads(rest);
    if (padId === id) setPadId(rest[0].id);
    setEditing(null);
    go('pads');
    setToastText('Pad deleted');
  };

  let sheetEl = null;
  if (sheet) {
    const t = sheet.type;
    if (t === 'patient') sheetEl = <PatientSheet rx={rx} setPatient={setPatient} showMissing={showMissing} onClose={close} />;
    else if (t === 'complaints') sheetEl = <ComplaintsSheet value={rx.complaints} onChange={(v) => update((r) => ({ ...r, complaints: v }))} onClose={close} />;
    else if (t === 'vitals') sheetEl = <VitalsSheet v={rx.vitals} setVital={setVital} onClose={close} />;
    else if (t === 'diagnosis') sheetEl = <DiagnosisSheet value={rx.diagnosis} showMissing={showMissing} onChange={(v) => update((r) => ({ ...r, diagnosis: v }))} onClose={close} />;
    else if (t === 'tests') sheetEl = <TestsSheet tests={rx.tests} onChange={(v) => update((r) => ({ ...r, tests: v }))} onClose={close} />;
    else if (t === 'advice') sheetEl = <AdviceSheet advice={rx.advice} onChange={(v) => update((r) => ({ ...r, advice: v }))} onClose={close} />;
    else if (t === 'follow') sheetEl = <FollowSheet fu={rx.followUp} base={new Date(rx.createdAt)} onChange={(v) => update((r) => ({ ...r, followUp: v }))} onClose={close} />;
    else if (t === 'med') sheetEl = <MedSheet key={sheet.id || 'new'} med={rx.meds.find((x) => x.id === sheet.id)} rx={rx} memory={memory} onSave={saveMed} onRemove={removeMed} onClose={close} />;
    else if (t === 'pads') sheetEl = <PadsSheet pads={pads} padId={padId} onPick={(id) => { pickPad(id); close(); }} onManage={() => { close(); go('pads'); }} onClose={close} />;
    else if (t === 'new') sheetEl = <ConfirmNewSheet onConfirm={startNew} onClose={close} />;
    else if (t === 'discard') {
      sheetEl = <DiscardSheet name={clean(rx.patient.name)} onClose={() => { setPending(null); close(); }}
        onDiscard={() => { const fn = pending; setPending(null); close(); if (fn) fn(); }} />;
    }
  }

  let body;
  if (screen === 'home') {
    body = (
      <HomeScreen pad={pad} pads={pads} saved={saved} padOf={padOf} draft={draftDirty ? rx : null}
        onWrite={writeNew} onHand={() => go('hand')} onContinue={() => go('write')} onFolder={() => go('folder')} onPads={() => go('pads')} onOpen={openSaved} />
    );
  } else if (screen === 'write') {
    body = (
      <div className="layout">
        <WriteScreen pad={pad} rx={rx} alerts={alerts} missing={missing} showMissing={showMissing} open={open} onPreview={goPreview} onNew={() => open('new')} />
        <aside className="live" aria-label="Live preview">
          <p className="live-h">Live preview <span>A4 · {TEMPLATES[pad.template].name}</span></p>
          <ScaledDoc key={pad.template} pad={pad} rx={rx} />
        </aside>
      </div>
    );
  } else if (screen === 'preview') {
    body = (
      <SendScreen pad={pad} rx={rx} alerts={alerts} title="Ready to send" subtitle={`${pad.label} · ${TEMPLATES[pad.template].name} template`}
        backLabel="Edit" onBack={() => setScreen('write')} saveState={saveState} onSave={onSave} onShared={onShared}
        onAddNumber={() => { setScreen('write'); open('patient'); }} toast={setToastText}>
        <button type="button" className="btn" onClick={writeNew}>Start a new prescription</button>
      </SendScreen>
    );
  } else if (screen === 'view' && viewEntry) {
    const nm = clean(viewEntry.patient.name);
    body = (
      <SendScreen pad={viewPad} rx={viewEntry} alerts={viewAlerts} title={nm}
        subtitle={`${clean(viewEntry.diagnosis)} · ${fmtDateTime(new Date(viewEntry.createdAt))}${viewEntry.editedAt ? ` · Edited* ${fmtDateTime(new Date(viewEntry.editedAt))}` : ''}`}
        backLabel="My prescriptions" onBack={() => go('folder')} saveState={null} toast={setToastText}
        before={<VisitList key={clean(viewEntry.patient.pid) || viewEntry.id} visits={viewVisits} currentId={viewEntry.id} padOf={padOf} onOpen={openSaved} />}
        bar={(
          <>
            <button type="button" className="btn btn-primary big" onClick={() => writeForPatient(viewEntry)}>
              <IconPen /> <span>Write new for {nm.split(' ')[0] || 'this patient'}</span>
            </button>
            <div className="bar-sub">
              <button type="button" className="btn-text" onClick={() => repeatSaved(viewEntry)}><IconRepeat size={16} /> Repeat all</button>
              <span>also copies diagnosis, medicines, tests and advice</span>
            </div>
          </>
        )}>
        <DeleteSaved key={viewEntry.id} entry={viewEntry} onEdit={() => editSaved(viewEntry)} onDelete={() => deleteSaved(viewEntry.id)} />
      </SendScreen>
    );
  } else if (screen === 'hand') {
    body = <HandScreen pads={pads} padId={padId} toast={setToastText} />;
  } else if (screen === 'pads') {
    body = <PadsScreen pads={pads} padId={padId} onUse={pickPad} onEdit={editPad} onDuplicate={(id) => duplicatePad(pads.find((p) => p.id === id))} onDelete={deletePad} onNew={newPad} />;
  } else if (screen === 'padEdit' && editing) {
    body = (
      <PadEditor key={editing.pad.id} initial={editing.pad} isNew={editing.isNew} canDelete={pads.length > 1}
        onSave={savePad} onCancel={() => { setEditing(null); go('pads'); }} onDuplicate={duplicatePad} onDelete={deletePad} />
    );
  } else {
    body = <FolderScreen saved={saved} padOf={padOf} onOpen={openSaved} onWrite={writeNew} />;
  }

  const atHome = screen === 'home';
  return (
    <div className="app">
      <header className="topbar">
        <div className="topbar-row">
          <button type="button" className="brand" onClick={() => { if (atHome) { if (onExit) onExit(); else setToastText('Back to your Physician panel'); return; } setEditing(null); go('home'); }} aria-label={atHome ? 'Back to Physician panel' : 'Back to Prescriptions home'}>
            <span className="brand-mark back" aria-hidden="true"><IconBack size={20} /></span>
            <span className="brand-text">
              <strong>{atHome ? 'Prescriptions' : SCREEN_TITLES[screen] || 'Prescriptions'}</strong>
              <small>{atHome ? 'Back to dashboard' : 'Prescriptions home'}</small>
            </span>
          </button>
          <button type="button" className="pad-switch" onClick={() => open('pads')} aria-label={`In use: ${pad.label}. Change pad`}>
            <span className="sw-dot" style={{ background: pad.accent }} aria-hidden="true" />
            <span className="sw-name">{pad.label}</span>
            <IconDown size={16} />
          </button>
        </div>
      </header>

      {body}
      {sheetEl}
      {toastText && <div className={`toast${screen === 'view' ? ' high' : ''}`} role="status">{toastText}</div>}
    </div>
  );
}

class Boundary extends React.Component {
  constructor(props) { super(props); this.state = { err: null }; }
  static getDerivedStateFromError(err) { return { err }; }
  render() {
    if (this.state.err) {
      return (
        <div className="crash">
          <h1>Something went wrong</h1>
          <p>The prototype hit an error: {String(this.state.err.message || this.state.err)}</p>
          <button type="button" className="btn" onClick={() => this.setState({ err: null })}>Try again</button>
        </div>
      );
    }
    return this.props.children;
  }
}




/* ================= PakMed integration ================= */
const RX_FONTS = "https://fonts.googleapis.com/css2?family=Herr+Von+Muellerhoff&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Serif:wght@600;700&family=Lora:ital,wght@0,600;0,700;1,600;1,700&family=Manrope:wght@400;500;600;700;800&family=Noto+Nastaliq+Urdu:wght@400;600&family=Source+Sans+3:wght@400;500;600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Work+Sans:wght@400;500;600;700&display=swap";

export default function PrescriptionPad({ doctor, onExit }) {
  setRxProfile(doctor);
  return (
    <div className="rxpad-root">
      <link rel="stylesheet" href={RX_FONTS} precedence="default" />
      <Boundary><App onExit={onExit} /></Boundary>
    </div>
  );
}

/* Read-only helpers for the admin panel */
export function readRxSaved() { try { return loadSaved(); } catch (e) { return []; } }
export function readRxPads() { try { return loadPads(); } catch (e) { return []; } }
export function RxPreview({ pad, rx, zoom }) {
  return (
    <div className="rxpad-root rxpad-embed">
      <link rel="stylesheet" href={RX_FONTS} precedence="default" />
      <ScaledDoc pad={normalizePad(pad)} rx={rx} zoom={zoom} />
    </div>
  );
}
export { TEMPLATES as RX_TEMPLATES, checkRx as rxCheck, fmtDateTime as rxFmtDateTime, ageText as rxAgeText, normalizePad as rxNormalizePad, enLine as rxEnLine, urLine as rxUrLine, medTitle as rxMedTitle };
