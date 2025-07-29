// Tremor Raw LineChart [v0.0.0]

"use client"

import { RiArrowLeftSLine, RiArrowRightSLine } from "@remixicon/react"
import React from "react"
import {
  CartesianGrid,
  Dot,
  Label,
  Line,
  Legend as RechartsLegend,
  LineChart as RechartsLineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { AxisDomain } from "recharts/types/util/types"

import {
  AvailableChartColors,
  AvailableChartColorsKeys,
  constructCategoryColors,
  getColorClassName,
  getYAxisDomain,
  hasOnlyOneValueForKey,
} from "@/registry/default/line-chart/lib/chart-utils"
import { useOnWindowResize } from "@/registry/default/line-chart/lib/use-on-window-resize"
import { cx } from "@/registry/default/utils/utils"

// getBadgeType function from the dashboard component
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

//#region Legend

interface LegendItemProps {
  name: string
  color: AvailableChartColorsKeys
  onClick?: (name: string, color: AvailableChartColorsKeys) => void
  activeLegend?: string
}

const LegendItem = ({
  name,
  color,
  onClick,
  activeLegend,
}: LegendItemProps) => {
  const hasOnValueChange = !!onClick
  return (
    <li
      className={cx(
        // base
        "group inline-flex flex-nowrap items-center gap-1.5 whitespace-nowrap rounded px-2 py-1 transition",
        hasOnValueChange
          ? "bg-transpaent cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
          : "cursor-default",
      )}
      onClick={(e) => {
        e.stopPropagation()
        onClick?.(name, color)
      }}
    >
      <span
        className={cx(
          "h-[3px] w-3.5 shrink-0 rounded-full",
          getColorClassName(color, "bg"),
          activeLegend && activeLegend !== name ? "opacity-40" : "opacity-100",
        )}
        aria-hidden="true"
      />
      <p
        className={cx(
          // base
          "truncate whitespace-nowrap text-xs",
          // text color
          "text-gray-700 dark:text-gray-300",
          hasOnValueChange &&
            "group-hover:text-gray-900 dark:group-hover:text-gray-50",
          activeLegend && activeLegend !== name ? "opacity-40" : "opacity-100",
        )}
      >
        {name}
      </p>
    </li>
  )
}
interface ScrollButtonProps {
  icon: React.ElementType
  onClick?: () => void
  disabled?: boolean
}

const ScrollButton = ({ icon, onClick, disabled }: ScrollButtonProps) => {
  const Icon = icon
  const [isPressed, setIsPressed] = React.useState(false)
  const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

  React.useEffect(() => {
    if (isPressed) {
      intervalRef.current = setInterval(() => {
        onClick?.()
      }, 300)
    } else {
      clearInterval(intervalRef.current as NodeJS.Timeout)
    }
    return () => clearInterval(intervalRef.current as NodeJS.Timeout)
  }, [isPressed, onClick])

  React.useEffect(() => {
    if (disabled) {
      clearInterval(intervalRef.current as NodeJS.Timeout)
      setIsPressed(false)
    }
  }, [disabled])

  return (
    <button
      type="button"
      className={cx(
        // base
        "group inline-flex size-5 items-center truncate rounded transition",
        disabled
          ? "cursor-not-allowed text-gray-400 dark:text-gray-600"
          : "cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-50",
      )}
      disabled={disabled}
      onClick={onClick}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
    >
      <Icon className="size-3" aria-hidden="true" />
    </button>
  )
}

interface LegendProps extends React.OlHTMLAttributes<HTMLOListElement> {
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  onClickLegendItem?: (category: string, color: string) => void
  activeLegend?: string
  enableLegendSlider?: boolean
}

type HasScrollProps = {
  left: boolean
  right: boolean
}

const Legend = React.forwardRef<HTMLOListElement, LegendProps>(
  (
    {
      categories,
      colors = AvailableChartColors,
      className,
      onClickLegendItem,
      activeLegend,
      enableLegendSlider = false,
      ...props
    },
    forwardedRef,
  ) => {
    const scrollableRef = React.useRef<HTMLInputElement>(null)
    const scrollButtonsRef = React.useRef<HTMLDivElement>(null)
    const [hasScroll, setHasScroll] = React.useState<HasScrollProps | null>(
      null,
    )
    const [isKeyDowned, setIsKeyDowned] = React.useState<string | null>(null)
    const intervalRef = React.useRef<NodeJS.Timeout | null>(null)

    const checkScroll = React.useCallback(() => {
      const scrollable = scrollableRef?.current
      if (!scrollable) return

      const hasLeftScroll = scrollable.scrollLeft > 0
      const hasRightScroll =
        scrollable.scrollWidth - scrollable.clientWidth >
        scrollable.scrollLeft

      setHasScroll({ left: hasLeftScroll, right: hasRightScroll })
    }, [setHasScroll])

    const scrollToTest = React.useCallback(
      (direction: "left" | "right") => {
        const element = scrollableRef?.current
        const scrollButtons = scrollButtonsRef?.current
        const scrollButtonsWith = scrollButtons?.clientWidth ?? 0
        const width = element?.clientWidth ?? 0

        if (element && enableLegendSlider) {
          element.scrollTo({
            left:
              direction === "left"
                ? element.scrollLeft - width + scrollButtonsWith
                : element.scrollLeft + width - scrollButtonsWith,
            behavior: "smooth",
          })
          setTimeout(() => {
            checkScroll()
          }, 400)
        }
      },
      [enableLegendSlider, checkScroll],
    )

    React.useEffect(() => {
      const keyDownHandler = (key: string) => {
        if (key === "ArrowLeft") {
          scrollToTest("left")
        } else if (key === "ArrowRight") {
          scrollToTest("right")
        }
      }
      if (isKeyDowned) {
        keyDownHandler(isKeyDowned)
        intervalRef.current = setInterval(() => {
          keyDownHandler(isKeyDowned)
        }, 300)
      } else {
        clearInterval(intervalRef.current as NodeJS.Timeout)
      }
      return () => clearInterval(intervalRef.current as NodeJS.Timeout)
    }, [isKeyDowned, scrollToTest])

    const keyDown = (e: KeyboardEvent) => {
      e.preventDefault()
      if (e.code === "ArrowLeft" || e.code === "ArrowRight") {
        setIsKeyDowned(e.code)
      }
    }
    const keyUp = (e: KeyboardEvent) => {
      e.preventDefault()
      setIsKeyDowned(null)
    }

    React.useEffect(() => {
      const scrollable = scrollableRef?.current
      if (enableLegendSlider) {
        checkScroll()
        scrollable?.addEventListener("keydown", keyDown)
        scrollable?.addEventListener("keyup", keyUp)

        // clean up if unmount
        return () => {
          scrollable?.removeEventListener("keydown", keyDown)
          scrollable?.removeEventListener("keyup", keyUp)
        }
      }
    }, [checkScroll, enableLegendSlider])

    return (
      <ol
        ref={forwardedRef}
        className={cx("relative overflow-hidden", className)}
        {...props}
      >
        <div
          ref={scrollableRef}
          tabIndex={0}
          className={cx(
            "flex h-full",
            enableLegendSlider
              ? "snap-x snap-mandatory overflow-auto pl-4 pr-12 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              : "flex-wrap",
          )}
        >
          {categories.map((category, index) => (
            <LegendItem
              key={`item-${index}`}
              name={category}
              color={colors[index] as AvailableChartColorsKeys}
              onClick={onClickLegendItem}
              activeLegend={activeLegend}
            />
          ))}
        </div>
        {enableLegendSlider && (
          <div
            ref={scrollButtonsRef}
            className={cx(
              "absolute bottom-0 right-0 top-0 flex h-full items-center justify-center pr-1",
              "bg-white dark:bg-gray-950",
            )}
          >
            <ScrollButton
              icon={RiArrowLeftSLine}
              onClick={() => {
                setIsKeyDowned(null)
                scrollToTest("left")
              }}
              disabled={!hasScroll?.left}
            />
            <ScrollButton
              icon={RiArrowRightSLine}
              onClick={() => {
                setIsKeyDowned(null)
                scrollToTest("right")
              }}
              disabled={!hasScroll?.right}
            />
          </div>
        )}
      </ol>
    )
  },
)

Legend.displayName = "Legend"

//#endregion

interface ChartTooltipRowProps {
  value: string
  name: string
  color: string
}

const ChartTooltipRow = ({ value, name, color }: ChartTooltipRowProps) => (
  <div className="flex items-center justify-between space-x-8">
    <div className="flex items-center space-x-2">
      <span
        aria-hidden="true"
        className={cx("h-[3px] w-3.5 shrink-0 rounded-full", color)}
      />
      <p
        className={cx(
          // base
          "whitespace-nowrap text-right",
          // text color
          "text-gray-700 dark:text-gray-300",
        )}
      >
        {name}
      </p>
    </div>
    <p
      className={cx(
        // base
        "whitespace-nowrap text-right font-medium tabular-nums",
        // text color
        "text-gray-900 dark:text-gray-50",
      )}
    >
      {value}
    </p>
  </div>
)

interface ChartTooltipProps {
  active: boolean | undefined
  payload: any
  label: string
  categoryColors: Map<string, AvailableChartColorsKeys>
  valueFormatter: (value: number) => string
}

const ChartTooltip = ({
  active,
  payload,
  label,
  categoryColors,
  valueFormatter,
}: ChartTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div
        className={cx(
          // base
          "rounded-md border text-sm shadow-md",
          // border color
          "border-gray-200 dark:border-gray-800",
          // background color
          "bg-white dark:bg-gray-950",
        )}
      >
        <div className={cx("border-b border-inherit px-4 py-2")}>
          <p
            className={cx(
              // base
              "font-medium",
              // text color
              "text-gray-900 dark:text-gray-50",
            )}
          >
            {label}
          </p>
        </div>

        <div className={cx("space-y-1 px-4 py-2")}>
          {payload
            .sort((a: any, b: any) => b.value - a.value)
            .map((item: any, index: number) => (
              <ChartTooltipRow
                key={`id-${index}`}
                value={valueFormatter(item.value)}
                name={item.dataKey}
                color={getColorClassName(
                  categoryColors.get(item.dataKey) as AvailableChartColorsKeys,
                  "bg",
                )}
              />
            ))}
        </div>
      </div>
    )
  }
  return null
}

//#region LineChart

export interface LineChartProps
  extends React.HTMLAttributes<HTMLDivElement> {
  data: Record<string, any>[]
  index: string
  categories: string[]
  colors?: AvailableChartColorsKeys[]
  valueFormatter?: (value: number) => string
  startEndOnly?: boolean
  showXAxis?: boolean
  showYAxis?: boolean
  showGridLines?: boolean
  yAxisWidth?: number
  intervalType?: "preserveStartEnd" | "equidistantPreserveStart"
  showTooltip?: boolean
  showLegend?: boolean
  autoMinValue?: boolean
  minValue?: number
  maxValue?: number
  allowDecimals?: boolean
  connectNulls?: boolean
  noDataText?: string
  onValueChange?: (value: any, category: string) => void
  enableLegendSlider?: boolean
  tickGap?: number
  xAxisLabel?: string
  yAxisLabel?: string
}

const LineChart = React.forwardRef<HTMLDivElement, LineChartProps>(
  (
    {
      data = [],
      categories = [],
      index,
      colors = AvailableChartColors,
      valueFormatter = (value: number) => value.toString(),
      startEndOnly = false,
      showXAxis = true,
      showYAxis = true,
      showGridLines = true,
      yAxisWidth = 56,
      intervalType = "equidistantPreserveStart",
      showTooltip = true,
      showLegend = true,
      autoMinValue = false,
      minValue,
      maxValue,
      allowDecimals = true,
      connectNulls = false,
      noDataText,
      className,
      onValueChange,
      enableLegendSlider = false,
      tickGap = 5,
      xAxisLabel,
      yAxisLabel,
      ...props
    },
    forwardedRef,
  ) => {
    const CustomTooltip = React.useCallback(
      (props: any) => {
        const { active, payload, label } = props
        return (
          <ChartTooltip
            active={active}
            payload={payload}
            label={label}
            valueFormatter={valueFormatter}
            categoryColors={categoryColors}
          />
        )
      },
      [valueFormatter],
    )

    const [legendHeight, setLegendHeight] = React.useState(60)
    const [activeDot, setActiveDot] = React.useState<any>(undefined)
    const [activeLegend, setActiveLegend] = React.useState<string | undefined>(
      undefined,
    )
    const categoryColors = constructCategoryColors(categories, colors)

    const yAxisDomain = getYAxisDomain(autoMinValue, minValue, maxValue)
    const hasOnValueChange = !!onValueChange

    function onDotClick(itemData: any, event: React.MouseEvent) {
      event.stopPropagation()

      if (!hasOnValueChange) return
      if (
        (itemData.index === activeDot?.index &&
          itemData.dataKey === activeDot?.dataKey) ||
        (hasOnlyOneValueForKey(data, itemData.dataKey) &&
          activeLegend &&
          activeLegend === itemData.dataKey)
      ) {
        setActiveDot(undefined)
        onValueChange?.(null, "")
      } else {
        setActiveDot({
          index: itemData.index,
          dataKey: itemData.dataKey,
        })
        onValueChange?.(itemData, itemData.dataKey)
      }
    }

    function onCategoryClick(dataKey: string) {
      if (!hasOnValueChange) return
      if (
        (dataKey === activeLegend && !activeDot) ||
        (hasOnlyOneValueForKey(data, dataKey) &&
          activeDot &&
          activeDot.dataKey === dataKey)
      ) {
        setActiveLegend(undefined)
        onValueChange?.(null, "")
      } else {
        setActiveLegend(dataKey)
        onValueChange?.(data.map((entry) => entry[dataKey]), dataKey)
      }
    }

    const legendRef = React.useRef<HTMLDivElement>(null)

    useOnWindowResize(() => {
      const calculateHeight = (height: number | undefined) =>
        height ? Number(height) + 15 : 60
      setLegendHeight(calculateHeight(legendRef.current?.clientHeight))
    })

    const filteredData = data.filter((item) => item[index] !== undefined)

    return (
      <div ref={forwardedRef} className={cx("w-full", className)} {...props}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsLineChart
            data={filteredData}
            onClick={
              hasOnValueChange && (activeLegend || activeDot)
                ? () => {
                    setActiveLegend(undefined)
                    setActiveDot(undefined)
                    onValueChange?.(null, "")
                  }
                : undefined
            }
            margin={{
              bottom: showXAxis ? 20 : 5,
              left: showYAxis ? 20 : 5,
              right: showYAxis ? 5 : 5,
              top: 5,
            }}
          >
            {showGridLines ? (
              <CartesianGrid
                className={cx("stroke-gray-200 stroke-1 dark:stroke-gray-800")}
                horizontal={true}
                vertical={false}
              />
            ) : null}
            <XAxis
              hide={!showXAxis}
              dataKey={index}
              tick={{ transform: "translate(0, 6)" }}
              ticks={
                startEndOnly
                  ? [filteredData[0]?.[index], filteredData[filteredData.length - 1]?.[index]]
                  : undefined
              }
              fill=""
              stroke=""
              className={cx(
                // base
                "text-xs",
                // text fill
                "fill-gray-500 dark:fill-gray-500",
              )}
              tickLine={false}
              axisLine={false}
              minTickGap={tickGap}
              interval={startEndOnly ? 0 : intervalType}
            >
              {xAxisLabel && (
                <Label
                  position="insideBottom"
                  offset={-5}
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                >
                  {xAxisLabel}
                </Label>
              )}
            </XAxis>
            <YAxis
              width={yAxisWidth}
              hide={!showYAxis}
              axisLine={false}
              tickLine={false}
              type="number"
              domain={yAxisDomain as AxisDomain}
              tick={{ transform: "translate(-3, 0)" }}
              fill=""
              stroke=""
              className={cx(
                // base
                "text-xs",
                // text fill
                "fill-gray-500 dark:fill-gray-500",
              )}
              tickFormatter={valueFormatter}
              allowDecimals={allowDecimals}
            >
              {yAxisLabel && (
                <Label
                  angle={-90}
                  position="insideLeft"
                  style={{ textAnchor: "middle" }}
                  className="fill-gray-800 text-sm font-medium dark:fill-gray-200"
                >
                  {yAxisLabel}
                </Label>
              )}
            </YAxis>
            <Tooltip
              wrapperStyle={{ outline: "none" }}
              isAnimationActive={true}
              animationDuration={100}
              cursor={{ stroke: "#374151", strokeWidth: 1 }}
              offset={20}
              position={{ y: 0 }}
              content={showTooltip ? CustomTooltip : <></>}
            />
            {showLegend ? (
              <RechartsLegend
                verticalAlign="top"
                height={legendHeight}
                content={({ payload }) =>
                  payload ? (
                    <div
                      ref={legendRef}
                      className={cx("flex items-center", {
                        "justify-center": !enableLegendSlider,
                      })}
                    >
                      <Legend
                        categories={payload.map((entry: any) => entry.value)}
                        colors={payload.map((entry: any) =>
                          categoryColors.get(entry.value) || "blue",
                        )}
                        onClickLegendItem={onCategoryClick}
                        activeLegend={activeLegend}
                        enableLegendSlider={enableLegendSlider}
                      />
                    </div>
                  ) : null
                }
              />
            ) : null}
            {categories.map((category) => (
              <Line
                className={cx(
                  getColorClassName(
                    categoryColors.get(category) as AvailableChartColorsKeys,
                    "stroke",
                  ),
                )}
                strokeOpacity={
                  activeLegend && activeLegend !== category ? 0.3 : 1
                }
                activeDot={(props: any) => {
                  const {
                    cx: cxCoord,
                    cy: cyCoord,
                    stroke,
                    strokeLinecap,
                    strokeLinejoin,
                    strokeWidth,
                    dataKey,
                  } = props
                  return (
                    <Dot
                      className={cx(
                        "stroke-white dark:stroke-gray-950",
                        onValueChange ? "cursor-pointer" : "",
                        getColorClassName(
                          categoryColors.get(dataKey) as AvailableChartColorsKeys,
                          "fill",
                        ),
                      )}
                      cx={cxCoord}
                      cy={cyCoord}
                      r={5}
                      fill=""
                      stroke={stroke}
                      strokeLinecap={strokeLinecap}
                      strokeLinejoin={strokeLinejoin}
                      strokeWidth={strokeWidth}
                      onClick={(_: any, event: React.MouseEvent) =>
                        onDotClick(props, event)
                      }
                    />
                  )
                }}
                dot={(props: any) => {
                  const {
                    stroke,
                    strokeLinecap,
                    strokeLinejoin,
                    strokeWidth,
                    cx: cxCoord,
                    cy: cyCoord,
                    dataKey,
                    index,
                  } = props

                  if (
                    (hasOnValueChange &&
                      (activeDot || (activeLegend && activeLegend !== dataKey))) ||
                    (activeDot?.index === index && activeDot?.dataKey === dataKey)
                  ) {
                    return (
                      <Dot
                        key={index}
                        cx={cxCoord}
                        cy={cyCoord}
                        r={5}
                        stroke={stroke}
                        fill=""
                        strokeLinecap={strokeLinecap}
                        strokeLinejoin={strokeLinejoin}
                        strokeWidth={strokeWidth}
                        className={cx(
                          "stroke-white dark:stroke-gray-950",
                          onValueChange ? "cursor-pointer" : "",
                          getColorClassName(
                            categoryColors.get(dataKey) as AvailableChartColorsKeys,
                            "fill",
                          ),
                        )}
                      />
                    )
                  }
                  return <Dot key={index} r={0} stroke={stroke} fill="" />
                }}
                key={category}
                dataKey={category}
                stroke=""
                strokeWidth={2}
                strokeLinejoin="round"
                strokeLinecap="round"
                type="linear"
                connectNulls={connectNulls}
              />
            ))}
            {/* hidden lines to increase click target area */}
            {onValueChange
              ? categories.map((category) => (
                  <Line
                    className={cx("cursor-pointer")}
                    strokeOpacity={0}
                    key={category}
                    dataKey={category}
                    stroke="transparent"
                    fill="transparent"
                    legendType="none"
                    tooltipType="none"
                    strokeWidth={12}
                    connectNulls={connectNulls}
                    onClick={(props: any, event: React.MouseEvent) => {
                      event.stopPropagation()
                      onDotClick(props, event)
                    }}
                  />
                ))
              : null}
          </RechartsLineChart>
        </ResponsiveContainer>

        {noDataText && filteredData.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <p
              className={cx(
                // base
                "text-sm",
                // text color
                "text-gray-500 dark:text-gray-500",
              )}
            >
              {noDataText}
            </p>
          </div>
        ) : null}
      </div>
    )
  },
)

LineChart.displayName = "LineChart"

//#endregion

export { LineChart }