import * as React from 'react';
import { cn } from '@/lib/utils';

interface FieldProps extends React.ComponentProps<'div'> {
	orientation?: 'vertical' | 'horizontal';
}

function Field({ className, orientation = 'vertical', ...props }: FieldProps) {
	return (
		<div
			data-slot='field'
			className={cn(
				'flex gap-2',
				orientation === 'horizontal'
					? 'flex-row items-center justify-between'
					: 'flex-col',
				className,
			)}
			{...props}
		/>
	);
}

function FieldLabel({ className, ...props }: React.ComponentProps<'label'>) {
	return (
		<label
			data-slot='label'
			className={cn(
				'text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
				className,
			)}
			{...props}
		/>
	);
}

function FieldContent({ className, ...props }: React.ComponentProps<'div'>) {
	return <div className={cn('space-y-1', className)} {...props} />;
}

function FieldTitle({ className, ...props }: React.ComponentProps<'span'>) {
	return (
		<span
			className={cn('font-medium leading-none block', className)}
			{...props}
		/>
	);
}

function FieldDescription({ className, ...props }: React.ComponentProps<'p'>) {
	return (
		<p
			data-slot='description'
			className={cn('text-[0.8rem] text-muted-foreground', className)}
			{...props}
		/>
	);
}

export { Field, FieldLabel, FieldContent, FieldTitle, FieldDescription };
