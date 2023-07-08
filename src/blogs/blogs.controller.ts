import { Controller, Get, HttpCode, HttpStatus, Query } from '@nestjs/common';
import {
  QueryInputModel,
  SearchNameTerm,
} from '../pagination/pagination.models';
import { BlogsQueryRepo } from './blogs.query.repo';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsQueryRepo: BlogsQueryRepo, // protected blogsService: BlogsService, // private readonly postsService: PostsService,
  ) {}
  @Get()
  @HttpCode(HttpStatus.OK)
  async getBlogs(@Query() query: QueryInputModel & SearchNameTerm) {
    return await this.blogsQueryRepo.getSortedBlogs(
      query.searchNameTerm,
      Number(query.pageNumber),
      Number(query.pageSize),
      query.sortBy,
      query.sortDirection,
    );
  }
  // @Get(':id')
  // @HttpCode(HttpStatus.OK)
  // async getBlog(@Param('id') blogId: string) {
  //   const blog = await this.blogsService.findBlogById(blogId);
  //   if (!blog) {
  //     res.sendStatus(404);
  //     return;
  //   }
  //   res.send(getByIdBlog);
  //   return;
  // }
  // async getPostsByBlog(
  //   req: RequestParamsAndInputQuery<{ blogId: string }, QueryInputModel>,
  //   res: ResponseViewBody<PaginatorType<PostView[]>>,
  // ) {
  //   const getByBlogIdPosts = await this.blogsQueryRepo.searchPostByBlogId(
  //     req.params.blogId,
  //     Number(req.query.pageNumber),
  //     Number(req.query.pageSize),
  //     req.query.sortBy,
  //     req.query.sortDirection,
  //     req.user?.id,
  //   );
  //
  //   if (!getByBlogIdPosts) {
  //     res.sendStatus(404);
  //     return;
  //   }
  //   res.send(getByBlogIdPosts);
  // }
}
