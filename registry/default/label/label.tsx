// Tremor Raw Label [v0.0.0]

import * as LabelPrimitives from "@radix-ui/react-label"
import * as React from "react"

import { cx } from "@/registry/default/utils/utils"

interface CheckboxProps
  extends React.ComponentPropsWithoutRef<typeof LabelPrimitives.Root> {
  disabled?: boolean
}

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitives.Root>,
  CheckboxProps
>(({ className, disabled, ...props }, forwardedRef) => (
  <LabelPrimitives.Root
    ref={forwardedRef}
    className={cx(
      // base
      "text-sm leading-none",
      // text color
      "text-gray-900 dark:text-gray-50",
      // disabled
      {
        "text-gray-400 dark:text-gray-600": disabled,
      },
      className,
    )}
    aria-disabled={disabled}
    {...props}
  />
))
Label.displayName = "Label"

export { Label }