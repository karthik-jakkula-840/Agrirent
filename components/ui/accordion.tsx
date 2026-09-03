import { Accordion as AccordionPrimitive } from "@base-ui/react/accordion"

import { cn } from "@/lib/utils"
import { PlusIcon, MinusIcon } from "lucide-react"

interface AccordionProps extends React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Root> {
  type?: 'single' | 'multiple';
  collapsible?: boolean;
}

function Accordion({ className, type, collapsible, multiple, ...props }: AccordionProps) {
  const isMultiple = multiple ?? (type === 'multiple');
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      multiple={isMultiple}
      className={cn("flex w-full flex-col", className)}
      {...props}
    />
  )
}

function AccordionItem({ className, ...props }: AccordionPrimitive.Item.Props) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn("not-last:border-b", className)}
      {...props}
    />
  )
}

function AccordionTrigger({
  className,
  children,
  ...props
}: AccordionPrimitive.Trigger.Props) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "group/accordion-trigger relative flex flex-1 items-start justify-between rounded-lg border border-transparent py-2.5 text-left text-sm font-medium transition-all outline-none hover:underline focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:after:border-ring aria-disabled:pointer-events-none aria-disabled:opacity-50 **:data-[slot=accordion-trigger-icon]:ml-auto **:data-[slot=accordion-trigger-icon]:size-4 **:data-[slot=accordion-trigger-icon]:text-muted-foreground",
          className
        )}
        {...props}
      >
        {children}
        <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-50/80 text-gray-500 shrink-0 pointer-events-none group-aria-expanded/accordion-trigger:hidden ml-4">
          <PlusIcon className="h-5 w-5" />
        </div>
        <div className="items-center justify-center h-8 w-8 rounded-full bg-gray-50/80 text-gray-500 shrink-0 pointer-events-none hidden group-aria-expanded/accordion-trigger:flex ml-4">
          <MinusIcon className="h-5 w-5" />
        </div>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  )
}

function AccordionContent({
  className,
  children,
  ...props
}: AccordionPrimitive.Panel.Props) {
  return (
    <AccordionPrimitive.Panel
      data-slot="accordion-content"
      className="overflow-hidden text-sm data-open:animate-accordion-down data-closed:animate-accordion-up"
      {...props}
    >
      <div
        className={cn(
          "h-(--accordion-panel-height) pt-0 pb-2.5 data-ending-style:h-0 data-starting-style:h-0 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-foreground [&_p:not(:last-child)]:mb-4",
          className
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Panel>
  )
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
