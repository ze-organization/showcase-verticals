'use client'

import { useMemo, useState } from 'react'
import { ArrowRight, Calculator, CircleHelp, TrendingUp } from 'lucide-react'

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

function futureValue(monthlyContribution: number, annualReturn: number, years: number) {
  const monthlyRate = annualReturn / 100 / 12
  const months = years * 12

  if (monthlyRate === 0) return monthlyContribution * months
  return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate)
}

export function IraSavingsCalculator() {
  const [monthlyContribution, setMonthlyContribution] = useState(500)
  const [currentSavings, setCurrentSavings] = useState(10000)
  const [years, setYears] = useState(25)
  const [annualReturn, setAnnualReturn] = useState(7)

  const results = useMemo(() => {
    const growth = futureValue(monthlyContribution, annualReturn, years)
    const currentGrowth = currentSavings * Math.pow(1 + annualReturn / 100, years)
    const total = growth + currentGrowth
    const contributions = monthlyContribution * years * 12 + currentSavings
    return { total, contributions, earnings: Math.max(0, total - contributions) }
  }, [monthlyContribution, currentSavings, years, annualReturn])

  const updateNumber = (setter: (value: number) => void, value: string, min = 0) => {
    const parsed = Number(value)
    setter(Number.isFinite(parsed) ? Math.max(min, parsed) : min)
  }

  return (
    <section aria-labelledby="calculator-title" className="mx-auto w-full max-w-6xl">
      <div className="mb-8 max-w-2xl">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-medium text-emerald-800">
          <Calculator className="size-4" aria-hidden="true" />
          IRA planning tool
        </div>
        <h1 id="calculator-title" className="text-balance text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
          See what your savings could become.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-8 text-slate-600">
          Explore how consistent contributions and time can help grow your retirement savings.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(360px,0.9fr)]">
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="mb-7 flex items-start justify-between gap-4">
            <div>
              <h2 className="text-xl font-semibold text-slate-950">Your assumptions</h2>
              <p className="mt-1 text-sm text-slate-500">Adjust the numbers to fit your plan.</p>
            </div>
            <div className="hidden rounded-2xl bg-slate-100 p-3 text-slate-700 sm:block">
              <TrendingUp className="size-5" aria-hidden="true" /> 
            </div>
          </div> 

          <div className="grid gap-6 sm:grid-cols-2">
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Monthly contribution</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input aria-label="Monthly contribution" type="number" min="0" step="50" value={monthlyContribution} onChange={(event) => updateNumber(setMonthlyContribution, event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-base font-medium text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" />
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Current IRA savings</span>
              <div className="relative">
                <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">$</span>
                <input aria-label="Current IRA savings" type="number" min="0" step="500" value={currentSavings} onChange={(event) => updateNumber(setCurrentSavings, event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-4 text-base font-medium text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" />
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-slate-700">Years to save</span>
              <div className="relative">
                <input aria-label="Years to save" type="number" min="1" max="80" value={years} onChange={(event) => updateNumber(setYears, event.target.value, 1)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-16 text-base font-medium text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-400">years</span>
              </div>
            </label>
            <label className="flex flex-col gap-2">
              <span className="flex items-center gap-1.5 text-sm font-medium text-slate-700">Estimated annual return <CircleHelp className="size-3.5 text-slate-400" aria-label="A hypothetical annual investment return" /></span>
              <div className="relative">
                <input aria-label="Estimated annual return" type="number" min="0" max="30" step="0.5" value={annualReturn} onChange={(event) => updateNumber(setAnnualReturn, event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 pr-10 text-base font-medium text-slate-950 outline-none transition focus:border-emerald-600 focus:ring-4 focus:ring-emerald-600/10" />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">%</span>
              </div>
            </label>
          </div>

          <p className="mt-8 border-t border-slate-100 pt-5 text-xs leading-5 text-slate-500">
            This calculator is for educational purposes only. It assumes monthly contributions and does not account for fees, taxes, inflation, or changing returns.
          </p>
        </div>

        <div className="relative overflow-hidden rounded-3xl bg-slate-950 p-6 text-white shadow-xl sm:p-8">
          <div className="absolute -right-20 -top-20 size-64 rounded-full bg-emerald-400/20 blur-3xl" aria-hidden="true" />
          <div className="relative">
            <p className="text-sm font-medium text-slate-300">Estimated IRA value</p>
            <p className="mt-4 text-5xl font-semibold tracking-tight text-white sm:text-6xl">{currency.format(results.total)}</p>
            <p className="mt-3 max-w-xs text-sm leading-6 text-slate-300">Your estimated balance after {years} {years === 1 ? 'year' : 'years'} of saving.</p>

            <div className="my-8 h-px bg-white/15" />
            <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-1">
              <div>
                <dt className="text-sm text-slate-400">Your contributions</dt>
                <dd className="mt-1 text-xl font-medium text-white">{currency.format(results.contributions)}</dd>
              </div>
              <div>
                <dt className="text-sm text-slate-400">Estimated investment growth</dt>
                <dd className="mt-1 text-xl font-medium text-emerald-300">{currency.format(results.earnings)}</dd>
              </div>
            </dl>

            <button type="button" className="mt-10 inline-flex items-center gap-2 text-sm font-semibold text-emerald-300 transition hover:text-emerald-200 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-300">
              Learn more about IRAs <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

export default IraSavingsCalculator
