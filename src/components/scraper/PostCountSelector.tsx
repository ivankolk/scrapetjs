import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import { Plus, Minus } from 'lucide-react';

interface PostCountSelectorProps {
	count: number;
	onChange: (count: number) => void;
	disabled?: boolean;
}

export function PostCountSelector({
	count,
	onChange,
	disabled,
}: PostCountSelectorProps) {
	const handleDecrement = () => {
		onChange(Math.max(1, count - 1));
	};

	const handleIncrement = () => {
		onChange(count + 1);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const val = parseInt(e.target.value);
		if (!isNaN(val) && val >= 1) {
			onChange(val);
		}
	};

	return (
		<Field className='mt-8'>
			<FieldLabel>Number of Posts</FieldLabel>
			<div className='flex items-center gap-2'>
				<Button
					type='button'
					variant='outline'
					size='icon'
					onClick={handleDecrement}
					disabled={disabled || count <= 1}
				>
					<Minus className='h-4 w-4' />
				</Button>
				<Input
					type='number'
					value={count}
					onChange={handleInputChange}
					disabled={disabled}
					className='w-20 text-center font-mono'
				/>
				<Button
					type='button'
					variant='outline'
					size='icon'
					onClick={handleIncrement}
					disabled={disabled}
				>
					<Plus className='h-4 w-4' />
				</Button>
			</div>
			<FieldDescription>Approximate number of posts to fetch</FieldDescription>
		</Field>
	);
}
