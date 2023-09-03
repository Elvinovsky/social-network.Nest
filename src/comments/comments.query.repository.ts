import { PaginatorType } from '../pagination/pagination.models';
import { CommentViewDTO } from './comment.models';
import { InjectModel } from '@nestjs/mongoose';
import { Comment, CommentDocument, CommentModel } from './comment.schemas';
import { CommentMapper } from './helpers/comment.mapping';
import { Post, PostModel } from '../posts/post.schemas';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCountOfBlogs,
} from '../pagination/pagination.helpers';
import { DEFAULT_PAGE_SortBy } from '../common/constants';

export class CommentsQueryRepo {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModel,
    @InjectModel(Post.name) private postModel: PostModel,
    private readonly commentMapper: CommentMapper,
  ) {}
  async getCommentsByPostId(
    postId: string,
    pageNumber: number,
    pageSize: number,
    sortBy?: string,
    sortDirection?: string,
    userId?: string,
  ): Promise<PaginatorType<CommentViewDTO[]> | null> {
    const postIdForComment = await this.postModel.findById(postId);
    if (!postIdForComment) {
      return null;
    }
    const calculateOfFiles = await this.commentModel.countDocuments({
      postId: postId,
      'commentatorInfo.isBanned': { $ne: true },
    });

    const foundComments: CommentDocument[] = await this.commentModel
      .find({ postId: postId, 'commentatorInfo.isBanned': { $ne: true } })
      .sort({
        [getSortBy(sortBy)]: getDirection(sortDirection),
        [DEFAULT_PAGE_SortBy]: getDirection(sortDirection),
      })
      .skip(getSkip(getPageNumber(pageNumber), getPageSize(pageSize)))
      .limit(getPageSize(pageSize));
    return {
      pagesCount: pagesCountOfBlogs(calculateOfFiles, pageSize),
      page: getPageNumber(pageNumber),
      pageSize: getPageSize(pageSize),
      totalCount: calculateOfFiles,
      items: await this.commentMapper.comments(foundComments, userId),
    };
  }
}
