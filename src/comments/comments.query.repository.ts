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

  // async getAllCommentsForCurrentBlogger(
  //   query: QueryInputModel,
  //   userInfo: UserInfo,
  // ) {
  //   debugger;
  //   const blogs = await this.blogsQueryRepo.getSortedBlogsForCurrentBlogger(
  //     userInfo,
  //   );
  //   const blogsIdSorted = blogs.items.map((b) => b.id);
  //   const postsIdFilter = async (blogsIdArr) => {
  //     const postsId: any = [];
  //
  //     for (let i = 0; i < blogsIdArr.length; i++) {
  //       const posts = await this.postModel
  //         .find({
  //           blogId: objectIdHelper(blogsIdArr[i]),
  //         })
  //         .exec();
  //       if (posts) {
  //         await postsId.push(posts.map((p) => p.id));
  //       }
  //     }
  //
  //     return postsId;
  //   };
  //   let quantityDocument = 0;
  //   const itemsComments: CommentDocument[][] = [];
  //   const postsID = await postsIdFilter(blogsIdSorted);
  //   const postsIdSorted = postsID.flat();
  //
  //   for (let i = 0; i < postsIdSorted.length; i++) {
  //     const calculateOfFiles = await this.commentModel.countDocuments({
  //       postId: postsIdSorted[i],
  //       'commentatorInfo.isBanned': { $ne: true },
  //     });
  //
  //     const foundComments: CommentDocument[] = await this.commentModel
  //       .find({
  //         postId: postsIdSorted[i],
  //         'commentatorInfo.isBanned': { $ne: true },
  //       })
  //       .sort({
  //         [getSortBy(query.sortBy)]: getDirection(query.sortDirection),
  //         [DEFAULT_PAGE_SortBy]: getDirection(query.sortDirection),
  //       })
  //       .skip(
  //         getSkip(getPageNumber(query.pageNumber), getPageSize(query.pageSize)),
  //       )
  //       .limit(getPageSize(query.pageSize));
  //
  //     quantityDocument += calculateOfFiles;
  //     itemsComments.push(foundComments);
  //   }
  //
  //   return {
  //     pagesCount: pagesCountOfBlogs(quantityDocument, query.pageSize),
  //     page: getPageNumber(query.pageNumber),
  //     pageSize: getPageSize(query.pageSize),
  //     totalCount: quantityDocument,
  //     items: await this.commentMapper.comments(
  //       itemsComments.flat(),
  //       userInfo.userId,
  //     ),
  //   };
  // }
}
