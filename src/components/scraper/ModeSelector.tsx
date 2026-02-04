import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
	Field,
	FieldLabel,
	FieldDescription,
	FieldContent,
	FieldTitle,
} from '@/components/ui/field';
import type { ScrapeMode } from '@/hooks/useScraper';

interface ModeSelectorProps {
	mode: ScrapeMode;
	setMode: (mode: ScrapeMode) => void;
	disabled: boolean;
}

export function ModeSelector({ mode, setMode, disabled }: ModeSelectorProps) {
	return (
		<Field>
			<FieldLabel>Parsing Mode</FieldLabel>
			<RadioGroup
				value={mode}
				onValueChange={(val) => setMode(val as ScrapeMode)}
				disabled={disabled}
				className='max-w-sm'
			>
				<FieldLabel htmlFor='mode-post'>
					<Field orientation='horizontal' className='border p-3 rounded-lg'>
						<FieldContent>
							<FieldTitle>Single Post</FieldTitle>
							<FieldDescription>
								Extract content and replies from a specific thread.
							</FieldDescription>
						</FieldContent>
						<RadioGroupItem value='post' id='mode-post' />
					</Field>
				</FieldLabel>

				<FieldLabel htmlFor='mode-profile'>
					<Field orientation='horizontal' className='border p-3 rounded-lg'>
						<FieldContent>
							<FieldTitle>Profile Posts</FieldTitle>
							<FieldDescription>
								Get recent posts from a user profile.
							</FieldDescription>
						</FieldContent>
						<RadioGroupItem value='profile' id='mode-profile' />
					</Field>
				</FieldLabel>
			</RadioGroup>
		</Field>
	);
}
