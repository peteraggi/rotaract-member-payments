'use client'

import * as React from 'react'
import * as RadixRadioGroup from '@radix-ui/react-radio-group'
import { cn } from '@/lib/utils' // utility for conditional classes, see note below

const RadioGroup = React.forwardRef<
  React.ElementRef<typeof RadixRadioGroup.Root>,
  React.ComponentPropsWithoutRef<typeof RadixRadioGroup.Root>
>(({ className, ...props }, ref) => (
  <RadixRadioGroup.Root
    ref={ref}
    className={cn('grid gap-2', className)}
    {...props}
  />
))
RadioGroup.displayName = RadixRadioGroup.Root.displayName

const RadioGroupItem = React.forwardRef<
  React.ElementRef<typeof RadixRadioGroup.Item>,
  React.ComponentPropsWithoutRef<typeof RadixRadioGroup.Item>
>(({ className, ...props }, ref) => (
  <RadixRadioGroup.Item
    ref={ref}
    className={cn(
      'aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
      className
    )}
    {...props}
  >
    <RadixRadioGroup.Indicator className="flex items-center justify-center">
      <div className="h-2 w-2 rounded-full bg-current" />
    </RadixRadioGroup.Indicator>
  </RadixRadioGroup.Item>
))
RadioGroupItem.displayName = RadixRadioGroup.Item.displayName

export { RadioGroup, RadioGroupItem }
