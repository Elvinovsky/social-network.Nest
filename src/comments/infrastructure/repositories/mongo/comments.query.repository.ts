import {
  PaginatorType,
  QueryInputModel,
} from '../../../../pagination/pagination.models';
import { CommentViewDTO } from '../../../comment.models';
import { InjectModel } from '@nestjs/mongoose';
import {
  Comment,
  CommentDocument,
  CommentModel,
} from '../../../comment.schemas';
import { CommentMapper } from '../../../helpers/comment.mapping';
import { Post, PostModel } from '../../../../posts/post.schemas';
import {
  getDirection,
  getPageNumber,
  getPageSize,
  getSkip,
  getSortBy,
  pagesCountOfBlogs,
} from '../../../../pagination/pagination.helpers';
import { DEFAULT_PAGE_SortBy } from '../../../../common/constants';
import { UserInfo } from '../../../../users/user.models';
import { BlogsQueryRepo } from '../../../../blogs/infrastructure/repositories/blogs.query.repo';
import { Blog, BlogModel } from '../../../../blogs/blog.schemas';

export class CommentsQueryRepo {
  constructor(
    @InjectModel(Comment.name) private commentModel: CommentModel,
    @InjectModel(Post.name) private postModel: PostModel,
    @InjectModel(Blog.name) private blogModel: BlogModel,
    private readonly commentMapper: CommentMapper,
    private readonly blogsQueryRepo: BlogsQueryRepo,
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

  // Метод для получения всех комментариев, связанных с блогами пользователя.
  async getAllCommentsForCurrentBlogger(
    query: QueryInputModel,
    userInfo: UserInfo,
  ) {
    const blogs = await this.blogModel
      .find({
        'blogOwnerInfo.userId': userInfo.userId, // Поиск блогов текущего пользователя.
      })
      .sort({
        [getSortBy(query.sortBy)]: getDirection(query.sortDirection), // Сортировка по заданным параметрам.
        [DEFAULT_PAGE_SortBy]: getDirection(query.sortDirection),
      })
      .skip(
        getSkip(getPageNumber(query.pageNumber), getPageSize(query.pageSize)), // Пагинация.
      )
      .limit(getPageSize(query.pageSize))
      .lean()
      .exec();

    const blogIds: string[] = blogs.map((blog) => blog._id.toString()); // Извлечение идентификаторов блогов.

    // Поиск постов, связанных с блогами пользователя.
    const posts = await this.postModel
      .find({
        blogId: { $in: blogIds }, // Поиск по идентификаторам блогов.
      })
      .exec();

    const postIds: string[] = posts.map((post) => post._id.toString()); // Извлечение идентификаторов постов.

    // Параллельное выполнение запросов к комментариям с использованием Promise.all.
    const [quantityDocument, itemsComments] = await Promise.all([
      this.commentModel.countDocuments({
        postId: { $in: postIds }, // Поиск по идентификаторам постов.
        'commentatorInfo.isBanned': { $ne: true }, // Фильтрация по не заблокированным комментаторам.
      }),

      this.commentModel
        .find({
          postId: { $in: postIds }, // Поиск по идентификаторам постов.
          'commentatorInfo.isBanned': { $ne: true }, // Фильтрация по не заблокированным комментаторам.
        })
        .sort({
          [getSortBy(query.sortBy)]: getDirection(query.sortDirection), // Сортировка по заданным параметрам.
          [DEFAULT_PAGE_SortBy]: getDirection(query.sortDirection),
        })
        .skip(
          getSkip(getPageNumber(query.pageNumber), getPageSize(query.pageSize)), // Пагинация.
        )
        .limit(getPageSize(query.pageSize)),
    ]);

    // Возвращаем результаты в формате пагинации и маппим комментарии.
    return {
      pagesCount: pagesCountOfBlogs(quantityDocument, query.pageSize), // Вычисляем количество страниц.
      page: getPageNumber(query.pageNumber), // Получаем текущую страницу.
      pageSize: getPageSize(query.pageSize), // Получаем размер страницы.
      totalCount: quantityDocument, // Общее количество комментариев.
      items: await this.commentMapper.comments(itemsComments, userInfo.userId), // Маппим комментарии.
    };
  }
}
