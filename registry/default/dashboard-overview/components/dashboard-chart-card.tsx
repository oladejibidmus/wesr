import { Badge } from "@/registry/default/badge/badge"
import { LineChart } from "@/registry/default/line-chart/line-chart"
import { cx, formatters, percentageFormatter } from "@/registry/default/utils/utils"
import {
  eachDayOfInterval,
  formatDate,
  interval,
  isWithinInterval,
} from "date-fns"
import { DateRange } from "react-day-picker"

export type PeriodValue = "previous-period" | "last-year" | "no-comparison"

export type OverviewData = {
  date: Date
  "Rows read": number
  "Rows written": number
  "Queries": number
  "Payments completed": number
  "Sign ups": number
  "Logins": number
  "Sign outs": number
  "Support calls": number
}

export type CardProps = {
  title: keyof OverviewData
  type: "currency" | "unit"
  selectedDates: DateRange | undefined
  selectedPeriod: PeriodValue
  isThumbnail?: boolean
}

const formattingMap = {
  currency: formatters.currency,
  unit: formatters.unit,
}

export const getBadgeType = (value: number) => {
  if (value > 0) {
    return "success"
  } else if (value < 0) {
    if (value < -50) {
      return "warning"
    }
    return "error"
  } else {
    return "neutral"
  }
}

export const getPeriod = (
  selectedDates: DateRange | undefined,
  selectedPeriod: PeriodValue,
): DateRange | undefined => {
  if (!selectedDates?.from || !selectedDates?.to) return undefined
  
  const daysDiff = Math.ceil(
    (selectedDates.to.getTime() - selectedDates.from.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  if (selectedPeriod === "previous-period") {
    return {
      from: new Date(selectedDates.from.getTime() - daysDiff * 24 * 60 * 60 * 1000),
      to: selectedDates.from,
    }
  } else if (selectedPeriod === "last-year") {
    return {
      from: new Date(selectedDates.from.getFullYear() - 1, selectedDates.from.getMonth(), selectedDates.from.getDate()),
      to: new Date(selectedDates.to.getFullYear() - 1, selectedDates.to.getMonth(), selectedDates.to.getDate()),
    }
  }
  
  return undefined
}
// Sample data for demonstration - replace with actual data source
const sampleOverviews: OverviewData[] = [
  {
    date: new Date("2024-01-01"),
    "Rows read": 1000,
    "Rows written": 500,
    "Queries": 200,
    "Payments completed": 1500,
    "Sign ups": 50,
    "Logins": 300,
    "Sign outs": 250,
    "Support calls": 10,
  },
  // Add more sample data as needed
]

export function ChartCard({
  title,
  type,
  selectedDates,
  selectedPeriod,
  isThumbnail,
}: CardProps) {
  const formatter = formattingMap[type]
  const selectedDatesInterval =
    selectedDates?.from && selectedDates?.to
      ? interval(selectedDates.from, selectedDates.to)
      : null
  const allDatesInInterval =
    selectedDates?.from && selectedDates?.to
      ? eachDayOfInterval(interval(selectedDates.from, selectedDates.to))
      : null
  const prevDates = getPeriod(selectedDates, selectedPeriod)

  const prevDatesInterval =
    prevDates?.from && prevDates?.to
      ? interval(prevDates.from, prevDates.to)
      : null

  const data = sampleOverviews
    .filter((overview) => {
      if (selectedDatesInterval) {
        return isWithinInterval(overview.date, selectedDatesInterval)
      }
      return true
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const prevData = sampleOverviews    .filter((overview) => {
      if (prevDatesInterval) {
        return isWithinInterval(overview.date, prevDatesInterval)
      }
      return false
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const chartData = allDatesInInterval
    ?.map((date, index) => {
      const overview = data[index]
      const prevOverview = prevData[index]
      const value = (overview?.[title] as number) || null
      const previousValue = (prevOverview?.[title] as number) || null

      return {
        title,
        date: date,
        formattedDate: formatDate(date, "dd/MM/yyyy"),
        value,
        previousDate: prevOverview?.date,
        previousFormattedDate: prevOverview
          ? formatDate(prevOverview.date, "dd/MM/yyyy")
          : null,
        previousValue:
          selectedPeriod !== "no-comparison" ? previousValue : null,
        evolution:
          selectedPeriod !== "no-comparison" && value && previousValue
            ? (value - previousValue) / previousValue
            : undefined,
      }
    })
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())

  const categories =
    selectedPeriod === "no-comparison" ? ["value"] : ["value", "previousValue"]
  const value =
    chartData?.reduce((acc, item) => acc + (item.value || 0), 0) || 0
  const previousValue =
    chartData?.reduce((acc, item) => acc + (item.previousValue || 0), 0) || 0  const evolution =
    selectedPeriod !== "no-comparison"
      ? (value - previousValue) / previousValue
      : 0

  return (
    <div className={cx("transition")}>
      <div className="flex items-center justify-between gap-x-2">
        <div className="flex items-center gap-x-2">
          <dt className="font-bold text-gray-900 sm:text-sm dark:text-gray-50">
            {title}
          </dt>
          {selectedPeriod !== "no-comparison" && (
            <Badge variant={getBadgeType(evolution)}>
              {percentageFormatter(evolution)}
            </Badge>
          )}
        </div>
      </div>
      <div className="mt-2 flex items-baseline justify-between">
        <dd className="text-xl text-gray-900 dark:text-gray-50">
          {formatter(value)}
        </dd>
        {selectedPeriod !== "no-comparison" && (
          <dd className="text-sm text-gray-500">
            from {formatter(previousValue)}
          </dd>
        )}
      </div>
      <LineChart
        className="mt-6 h-32"
        data={chartData || []}
        index="formattedDate"
        colors={["indigo", "gray"]}
        startEndOnly={true}
        valueFormatter={(value) => formatter(value as number)}
        showYAxis={false}
        showLegend={false}
        categories={categories}
        showTooltip={isThumbnail ? false : true}
        autoMinValue
      />
    </div>
  )
}