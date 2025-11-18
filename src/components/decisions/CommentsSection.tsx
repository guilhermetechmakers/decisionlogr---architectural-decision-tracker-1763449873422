import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Send } from 'lucide-react';
import type { Comment, CommentInsert } from '@/api/decisions';

const commentSchema = z.object({
  body: z.string().min(1, 'Comment cannot be empty'),
});

type CommentFormData = z.infer<typeof commentSchema>;

interface CommentsSectionProps {
  decisionId: string;
  comments: Comment[];
  onCreateComment: (comment: CommentInsert) => void;
}

export function CommentsSection({
  decisionId,
  comments,
  onCreateComment,
}: CommentsSectionProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
  });

  const onSubmit = async (data: CommentFormData) => {
    onCreateComment({
      decision_id: decisionId,
      body: data.body,
      author_id: null, // Will be set by server
      author_meta: {},
    });
    reset();
  };

  // Build comment tree
  const topLevelComments = comments.filter((c) => !c.parent_comment_id);
  const getReplies = (parentId: string) =>
    comments.filter((c) => c.parent_comment_id === parentId);

  return (
    <div className="space-y-4">
      <ScrollArea className="h-[400px] pr-4">
        <div className="space-y-4">
          {topLevelComments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No comments yet. Start the conversation!
            </p>
          ) : (
            topLevelComments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                replies={getReplies(comment.id)}
              />
            ))
          )}
        </div>
      </ScrollArea>

      <Separator />

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
        <Textarea
          {...register('body')}
          placeholder="Add a comment or ask a question..."
          rows={3}
          className="resize-none"
        />
        <Button type="submit" size="sm" disabled={isSubmitting}>
          <Send className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Posting...' : 'Post Comment'}
        </Button>
      </form>
    </div>
  );
}

interface CommentItemProps {
  comment: Comment;
  replies: Comment[];
}

function CommentItem({ comment, replies }: CommentItemProps) {
  const authorName =
    comment.author_id
      ? comment.author_meta?.name || 'User'
      : comment.author_meta?.name || 'Guest';

  return (
    <div className="space-y-2">
      <div className="flex gap-3">
        <Avatar className="h-8 w-8">
          <AvatarFallback>{authorName[0].toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{authorName}</span>
            <span className="text-xs text-muted-foreground">
              {format(new Date(comment.created_at), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
          <p className="text-sm">{comment.body}</p>
        </div>
      </div>
      {replies.length > 0 && (
        <div className="ml-11 space-y-2 border-l-2 pl-4">
          {replies.map((reply) => (
            <CommentItem key={reply.id} comment={reply} replies={[]} />
          ))}
        </div>
      )}
    </div>
  );
}
