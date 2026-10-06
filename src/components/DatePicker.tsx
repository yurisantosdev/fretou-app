import { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';

const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'] as const;
const MONTHS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
] as const;
const MONTHS_SHORT = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'] as const;
const YEAR_GRID_SIZE = 12;
const HOURS = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, '0'));
const MINUTES = Array.from({ length: 60 }, (_, index) => String(index).padStart(2, '0'));

type CalendarView = 'days' | 'months' | 'years';

function toInputValue(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseInputValue(value: string): Date | null {
  if (!value) return null;
  const [year, month, day] = value.slice(0, 10).split('-').map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function formatShortDate(date: Date): string {
  return new Intl.DateTimeFormat('pt-BR').format(date);
}

function currentTimeValue(): string {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function parseTimeValue(value: string): string {
  const time = value.split('T')[1]?.slice(0, 5);
  return time && /^\d{2}:\d{2}$/.test(time) ? time : currentTimeValue();
}

function buildMonthGrid(visibleMonth: Date): Date[] {
  const first = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1, 12, 0, 0, 0);
  const start = new Date(first);
  start.setDate(first.getDate() - first.getDay());
  return Array.from({ length: 42 }, (_, index) => {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    day.setHours(12, 0, 0, 0);
    return day;
  });
}

function getYearRangeStart(year: number): number {
  return Math.floor(year / YEAR_GRID_SIZE) * YEAR_GRID_SIZE;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Selecione uma data',
  showTime = false,
  min,
  allowClear = true,
  showToday = true,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  showTime?: boolean;
  min?: string;
  allowClear?: boolean;
  showToday?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState<CalendarView>('days');
  const today = useMemo(() => {
    const now = new Date();
    now.setHours(12, 0, 0, 0);
    return now;
  }, []);
  const selectedDate = useMemo(() => parseInputValue(value), [value]);
  const selectedTime = useMemo(() => parseTimeValue(value), [value]);
  const minDate = useMemo(() => (min ? parseInputValue(min) : null), [min]);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const anchor = selectedDate ?? today;
    return new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0);
  });

  useEffect(() => {
    if (!open) setView('days');
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const anchor = selectedDate ?? today;
    setVisibleMonth(new Date(anchor.getFullYear(), anchor.getMonth(), 1, 12, 0, 0, 0));
  }, [open, selectedDate, today]);

  const monthGrid = useMemo(() => buildMonthGrid(visibleMonth), [visibleMonth]);
  const yearRangeStart = getYearRangeStart(visibleMonth.getFullYear());
  const yearGrid = Array.from({ length: YEAR_GRID_SIZE }, (_, index) => yearRangeStart + index);
  const headerLabel =
    view === 'days'
      ? `${MONTHS[visibleMonth.getMonth()]} ${visibleMonth.getFullYear()}`
      : view === 'months'
        ? String(visibleMonth.getFullYear())
        : `${yearRangeStart} – ${yearRangeStart + YEAR_GRID_SIZE - 1}`;

  function isBeforeMin(date: Date): boolean {
    return minDate ? toInputValue(date) < toInputValue(minDate) : false;
  }

  function emitValue(date: Date, time = selectedTime) {
    onChange(showTime ? `${toInputValue(date)}T${time}` : toInputValue(date));
  }

  function pickDate(date: Date) {
    if (isBeforeMin(date)) return;
    emitValue(date);
    setView('days');
    if (!showTime) setOpen(false);
  }

  function shiftVisibleMonth(years: number, months = 0) {
    setVisibleMonth(new Date(visibleMonth.getFullYear() + years, visibleMonth.getMonth() + months, 1, 12, 0, 0, 0));
  }

  return (
    <>
      <Pressable
        className={`h-11 flex-row items-center gap-2 rounded-xl border bg-white px-4 ${open ? 'border-brand' : 'border-line'}`}
        onPress={() => setOpen(true)}>
        <Text className="text-sm text-faint">Data</Text>
        <Text className={`min-w-0 flex-1 text-base ${selectedDate ? 'font-semibold text-navy' : 'text-placeholder'}`} numberOfLines={1}>
          {selectedDate ? formatShortDate(selectedDate) : placeholder}
        </Text>
        {showTime && selectedDate ? <Text className="text-base font-semibold text-navy">{selectedTime}</Text> : null}
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View className="flex-1 justify-end bg-navy/40">
          <Pressable className="flex-1" onPress={() => setOpen(false)} />
          <View className="rounded-t-3xl bg-white px-4 pb-8 pt-4">
            <View className="mb-3 flex-row items-center justify-between">
              <Pressable
                className="size-9 items-center justify-center rounded-xl"
                onPress={() => {
                  if (view === 'days') shiftVisibleMonth(0, -1);
                  else if (view === 'months') shiftVisibleMonth(-1);
                  else shiftVisibleMonth(-YEAR_GRID_SIZE);
                }}>
                <Text className="text-lg font-bold text-muted">‹</Text>
              </Pressable>
              <Pressable
                className="flex-1 items-center rounded-xl px-2 py-1"
                onPress={() => {
                  if (view === 'days') setView('months');
                  else if (view === 'months') setView('years');
                  else setView('months');
                }}>
                <Text className="text-sm font-semibold text-navy">{headerLabel}</Text>
              </Pressable>
              <Pressable
                className="size-9 items-center justify-center rounded-xl"
                onPress={() => {
                  if (view === 'days') shiftVisibleMonth(0, 1);
                  else if (view === 'months') shiftVisibleMonth(1);
                  else shiftVisibleMonth(YEAR_GRID_SIZE);
                }}>
                <Text className="text-lg font-bold text-muted">›</Text>
              </Pressable>
            </View>

            {view === 'days' ? (
              <>
                <View className="mb-1 flex-row">
                  {WEEKDAYS.map((label, index) => (
                    <Text key={`${label}-${index}`} className="flex-1 py-1 text-center text-[10px] font-semibold uppercase text-faint">
                      {label}
                    </Text>
                  ))}
                </View>
                <View className="flex-row flex-wrap">
                  {monthGrid.map((day) => {
                    const inCurrentMonth = day.getMonth() === visibleMonth.getMonth();
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                    const isToday = isSameDay(day, today);
                    const blocked = isBeforeMin(day);
                    return (
                      <Pressable
                        key={toInputValue(day)}
                        disabled={blocked}
                        style={{ width: '14.285%', height: 36 }}
                        className={`items-center justify-center rounded-lg ${
                          blocked ? '' : isSelected ? 'bg-brand' : isToday ? 'bg-brand/10' : ''
                        }`}
                        onPress={() => pickDate(day)}>
                        <Text
                          className={`text-xs font-semibold ${
                            blocked
                              ? 'text-placeholder/40'
                              : isSelected
                                ? 'text-white'
                                : isToday
                                  ? 'text-brand'
                                  : inCurrentMonth
                                    ? 'text-navy'
                                    : 'text-placeholder'
                          }`}>
                          {day.getDate()}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            ) : (
              <View className="min-h-60 flex-row flex-wrap">
                {view === 'months'
                  ? MONTHS_SHORT.map((label, monthIndex) => {
                      const isSelected =
                        selectedDate?.getMonth() === monthIndex && selectedDate.getFullYear() === visibleMonth.getFullYear();
                      const isCurrent = today.getMonth() === monthIndex && today.getFullYear() === visibleMonth.getFullYear();
                      return (
                        <Pressable
                          key={label}
                          style={{ width: '33.333%', height: 56 }}
                          className={`items-center justify-center rounded-xl ${isSelected ? 'bg-brand' : isCurrent ? 'bg-brand/10' : ''}`}
                          onPress={() => {
                            setVisibleMonth(new Date(visibleMonth.getFullYear(), monthIndex, 1, 12, 0, 0, 0));
                            setView('days');
                          }}>
                          <Text className={`text-sm font-semibold ${isSelected ? 'text-white' : isCurrent ? 'text-brand' : 'text-navy'}`}>
                            {label}
                          </Text>
                        </Pressable>
                      );
                    })
                  : yearGrid.map((year) => {
                      const isSelected = selectedDate?.getFullYear() === year;
                      const isCurrent = today.getFullYear() === year;
                      return (
                        <Pressable
                          key={year}
                          style={{ width: '33.333%', height: 56 }}
                          className={`items-center justify-center rounded-xl ${isSelected ? 'bg-brand' : isCurrent ? 'bg-brand/10' : ''}`}
                          onPress={() => {
                            setVisibleMonth(new Date(year, visibleMonth.getMonth(), 1, 12, 0, 0, 0));
                            setView('months');
                          }}>
                          <Text className={`text-sm font-semibold ${isSelected ? 'text-white' : isCurrent ? 'text-brand' : 'text-navy'}`}>
                            {year}
                          </Text>
                        </Pressable>
                      );
                    })}
              </View>
            )}

            {showTime && view === 'days' ? (
              <View className="mt-3 h-40 flex-row gap-2 border-t border-line pt-3">
                <TimeColumn
                  label="Hora"
                  options={HOURS}
                  value={selectedTime.slice(0, 2)}
                  onSelect={(hour) => emitValue(selectedDate ?? today, `${hour}:${selectedTime.slice(3)}`)}
                />
                <TimeColumn
                  label="Min"
                  options={MINUTES}
                  value={selectedTime.slice(3)}
                  onSelect={(minute) => emitValue(selectedDate ?? today, `${selectedTime.slice(0, 2)}:${minute}`)}
                />
              </View>
            ) : null}

            <View className="mt-3 flex-row items-center justify-between border-t border-line pt-3">
              {showToday ? (
                <Pressable
                  disabled={isBeforeMin(today)}
                  onPress={() => {
                    if (isBeforeMin(today)) return;
                    if (showTime) {
                      emitValue(new Date(), currentTimeValue());
                      setOpen(false);
                      return;
                    }
                    pickDate(today);
                  }}>
                  <Text className={`text-xs font-semibold text-brand ${isBeforeMin(today) ? 'opacity-40' : ''}`}>
                    {showTime ? 'Agora' : 'Hoje'}
                  </Text>
                </Pressable>
              ) : (
                <View />
              )}
              <View className="flex-row items-center gap-3">
                {allowClear && value ? (
                  <Pressable
                    onPress={() => {
                      onChange('');
                      setOpen(false);
                    }}>
                    <Text className="text-xs font-medium text-faint">Limpar</Text>
                  </Pressable>
                ) : null}
                {showTime ? (
                  <Pressable className="rounded-full bg-brand px-3 py-1" onPress={() => setOpen(false)}>
                    <Text className="text-xs font-semibold text-white">Pronto</Text>
                  </Pressable>
                ) : null}
              </View>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

function TimeColumn({
  label,
  options,
  value,
  onSelect,
}: {
  label: string;
  options: string[];
  value: string;
  onSelect: (next: string) => void;
}) {
  return (
    <View className="flex-1">
      <Text className="mb-1 text-center text-[10px] font-semibold uppercase text-faint">{label}</Text>
      <ScrollView nestedScrollEnabled contentOffset={{ x: 0, y: Math.max(0, Number(value) * 32 - 48) }}>
        {options.map((option) => {
          const active = option === value;
          return (
            <Pressable
              key={option}
              className={`h-8 items-center justify-center rounded-lg ${active ? 'bg-brand' : ''}`}
              onPress={() => onSelect(option)}>
              <Text className={`text-xs font-semibold ${active ? 'text-white' : 'text-navy'}`}>{option}</Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}
