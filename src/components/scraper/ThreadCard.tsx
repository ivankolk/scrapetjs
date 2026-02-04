import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';
import type { ThreadPost } from '@/types/threads';

interface ThreadCardProps {
	post: ThreadPost;
}

export function ThreadCard({ post }: ThreadCardProps) {
	const formatNumber = (num: number) => {
		return new Intl.NumberFormat('en-US', { notation: 'compact' }).format(num);
	};

	return (
		<Card>
			<CardHeader className='pb-4'>
				<div className='flex items-center gap-3'>
					<div className='h-10 w-10 shrink-0 overflow-hidden rounded-full bg-muted'>
						{post.author?.profilePicture && (
							// eslint-disable-next-line @next/next/no-img-element
							<img
								src={post.author.profilePicture}
								alt={post.author.username}
								className='h-full w-full object-cover'
								referrerPolicy='no-referrer'
								crossOrigin='anonymous'
							/>
						)}
					</div>
					<div className='flex h-10 flex-col justify-center'>
						<CardTitle className='text-base leading-none'>
							@{post.author?.username}
						</CardTitle>
						{post.publishedAt && (
							<CardDescription className='text-xs leading-none mt-1'>
								{new Date(post.publishedAt * 1000).toLocaleString()}
							</CardDescription>
						)}
					</div>
				</div>
			</CardHeader>
			<CardContent className='space-y-4'>
				<p className='whitespace-pre-wrap text-base'>{post.text}</p>
			</CardContent>
			<div className='flex items-center gap-4 border-t px-6 py-4 text-sm text-muted-foreground'>
				<div className='flex items-center gap-1'>
					<span className='font-medium text-foreground'>
						{formatNumber(post.stats?.likes || 0)}
					</span>{' '}
					Likes
				</div>
				<div className='flex items-center gap-1'>
					<span className='font-medium text-foreground'>
						{formatNumber(post.stats?.replies || 0)}
					</span>{' '}
					Replies
				</div>
			</div>
		</Card>
	);
}
