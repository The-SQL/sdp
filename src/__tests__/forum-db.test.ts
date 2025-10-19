/**
 * __tests__/forum-db.test.ts
 *
 * Fixed test suite for src/utils/db/forum.ts (forum DB service)
 * with proper Supabase method chaining mock
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
import * as moderation from "@/utils/moderation";
import * as clientModule from "@/utils/supabase/client";

// Mock Supabase client creator
jest.mock("@/utils/supabase/client", () => ({
  createClient: jest.fn(),
}));

jest.mock("@/utils/moderation", () => ({
  checkProfanity: jest.fn(),
}));

import {
    checkUserLikedPost,
    checkUserLikedReply,
    createNotification,
    createPost,
    createReply,
    fetchPosts,
    fetchPostsByUserInterests,
    getPost,
    getPostReplies,
    getTrendingTopics,
    getUnreadNotificationCount,
    getUserActivity,
    getUserNotifications,
    getUserPostLikes,
    getUserReplyLikes,
    likePost,
    likeReply,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    unlikePost,
    unlikeReply,
} from "@/utils/db/forum";
function createChainableMock(result: any) {
  const then = jest
    .fn()
    .mockImplementation((cb) => Promise.resolve(result).then(cb));

  const chain = {
    eq: jest.fn().mockReturnThis(),
    in: jest.fn().mockReturnThis(),
    contains: jest.fn().mockReturnThis(),
    order: jest.fn().mockReturnThis(),
    range: jest.fn().mockReturnThis(),
    then,
  };

  return chain;
}

describe("forum DB service", () => {
  let supabaseMock: any;
  let fromMock: jest.Mock;
  let selectMock: jest.Mock;
  let updateMock: jest.Mock;
  let eqMock: jest.Mock;
  let orderMock: jest.Mock;
  let rangeMock: jest.Mock;
  let insertMock: jest.Mock;
  let singleMock: jest.Mock;
  let rpcMock: jest.Mock;
  let deleteMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create chainable method mocks
    eqMock = jest.fn().mockReturnThis();
    orderMock = jest.fn().mockReturnThis();
    rangeMock = jest.fn().mockReturnThis();
    singleMock = jest.fn();
    deleteMock = jest.fn().mockReturnThis();

    // Mock for update chain
    updateMock = jest.fn().mockReturnValue({
      eq: eqMock,
      then: jest.fn().mockImplementation((callback) => {
        const result = Promise.resolve({ error: null });
        return result.then(callback);
      }),
    });

    selectMock = jest.fn().mockReturnValue({
      eq: eqMock,
      order: orderMock,
      range: rangeMock,
      single: singleMock,
      then: jest.fn().mockImplementation(function (this: any, callback) {
        const result = Promise.resolve({ data: null, error: null });
        return result.then(callback);
      }),
      or: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
    });

    insertMock = jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        single: singleMock,
      }),
    });

    // A robust fromMock that returns a fully chainable object by default
    fromMock = jest.fn().mockImplementation(() => ({
      select: selectMock,
      insert: insertMock,
      update: updateMock,
      delete: deleteMock,
      eq: eqMock,
      order: orderMock,
      range: rangeMock,
      single: singleMock,
      or: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      contains: jest.fn().mockReturnThis(),
    }));

    rpcMock = jest.fn().mockResolvedValue({ data: null, error: null });

    supabaseMock = {
      from: fromMock,
      rpc: rpcMock,
    };

    (clientModule.createClient as jest.Mock).mockReturnValue(supabaseMock);
    (moderation.checkProfanity as jest.Mock).mockResolvedValue({
      contains_profanity: false,
      censored_text: "",
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  // ---------- fetchPosts ----------
  describe("fetchPosts", () => {
    it("fetches posts with formatted replies/likes + pagination", async () => {
      const fakePosts = [
        {
          id: "p1",
          title: "Hello",
          replies: [{ count: 2 }],
          likes: [{ count: 5 }],
        },
      ];

      const mockThen = jest.fn().mockImplementation((callback) => {
        const result = Promise.resolve({
          data: fakePosts,
          error: null,
          count: 1,
        });
        return result.then(callback);
      });

      selectMock.mockReturnValue({
        eq: eqMock,
        order: orderMock,
        range: rangeMock.mockReturnValue({
          then: mockThen,
        }),
      });

      const res = await fetchPosts({ page: 1, limit: 10 });

      expect(fromMock).toHaveBeenCalledWith("forum_posts");
      expect(selectMock).toHaveBeenCalled();
    });

    it("throws when supabase returns error", async () => {
      const mockThen = jest.fn().mockImplementation((callback) => {
        const result = Promise.resolve({
          data: null,
          error: new Error("boom"),
          count: 0,
        });
        return result.then(callback);
      });

      selectMock.mockReturnValue({
        eq: eqMock,
        order: orderMock,
        range: rangeMock.mockReturnValue({
          then: mockThen,
        }),
      });

      await expect(fetchPosts({ page: 1 })).rejects.toThrow("boom");
    });
  });

  // ---------- fetchPostsByUserInterests ----------
  describe("fetchPostsByUserInterests", () => {
    it("returns general posts when user has no courses", async () => {
      const userCoursesMockThen = jest.fn().mockImplementation((callback) => {
        const result = Promise.resolve({ data: [], error: null });
        return result.then(callback);
      });

      const postsMockThen = jest.fn().mockImplementation((callback) => {
        const result = Promise.resolve({ data: [], error: null, count: 0 });
        return result.then(callback);
      });

      selectMock
        .mockReturnValueOnce({
          eq: eqMock.mockReturnValue({
            then: userCoursesMockThen,
          }),
        })
        .mockReturnValueOnce({
          eq: eqMock,
          order: orderMock,
          range: rangeMock.mockReturnValue({
            then: postsMockThen,
          }),
        });

      const res = await fetchPostsByUserInterests("user-1", 1, 10);
      expect(fromMock).toHaveBeenCalledWith("user_courses");
    });

    it("fetches posts based on user's course interests", async () => {
      const userCoursesResult = { data: [{ course_id: "c1" }], error: null };
      const courseTagsResult = { data: [{ tag_id: "t1" }], error: null };
      const tagsResult = { data: [{ name: "react" }], error: null };
      const postsResult = { data: [], error: null, count: 0 };

      selectMock
        // Step 1: user_courses
        .mockReturnValueOnce(createChainableMock(userCoursesResult))
        // Step 2: course_tags
        .mockReturnValueOnce(createChainableMock(courseTagsResult))
        // Step 3: tags
        .mockReturnValueOnce(createChainableMock(tagsResult))
        // Step 4: forum_posts
        .mockReturnValueOnce(createChainableMock(postsResult));

      const res = await fetchPostsByUserInterests("user-with-courses", 1, 10);

      expect(fromMock).toHaveBeenCalledWith("user_courses");
      expect(fromMock).toHaveBeenCalledWith("course_tags");
      expect(fromMock).toHaveBeenCalledWith("tags");
      expect(fromMock).toHaveBeenCalledWith("forum_posts");
      expect(selectMock).toHaveBeenCalledTimes(4);
    });

    it("throws when fetching user courses errors", async () => {
      const errorMockThen = jest.fn().mockImplementation((callback) => {
        const result = Promise.resolve({
          data: null,
          error: new Error("uc-error"),
        });
        return result.then(callback);
      });

      selectMock.mockReturnValueOnce({
        eq: eqMock.mockReturnValue({
          then: errorMockThen,
        }),
      });

      await expect(fetchPostsByUserInterests("u1")).rejects.toThrow("uc-error");
    });
  });

  // ---------- createPost ----------
  describe("createPost", () => {
    it("creates post and censors profanity", async () => {
      (moderation.checkProfanity as jest.Mock).mockResolvedValue({
        contains_profanity: true,
        censored_text: "censored content",
      });

      singleMock.mockResolvedValueOnce({
        data: { id: "np1", content: "censored content" },
        error: null,
      });

      const newPost = await createPost({
        title: "T",
        content: "badword",
        author_id: "u1",
        category: "general",
        language: "en",
        tags: ["a"],
      });

      expect(newPost.content).toBe("censored content");
      expect(fromMock).toHaveBeenCalledWith("forum_posts");
      expect(insertMock).toHaveBeenCalled();
    });

    it("throws when insert fails", async () => {
      (moderation.checkProfanity as jest.Mock).mockResolvedValue({
        contains_profanity: false,
        censored_text: "",
      });

      singleMock.mockResolvedValueOnce({
        data: null,
        error: new Error("insert failure"),
      });

      await expect(
        createPost({
          title: "T",
          content: "ok",
          author_id: "u1",
          category: "general",
          language: "en",
          tags: [],
        })
      ).rejects.toThrow("insert failure");
    });
  });

  // ---------- getPost ----------
  describe("getPost", () => {
    it("increments view count and returns post", async () => {
      rpcMock.mockResolvedValueOnce({ error: null });

      singleMock.mockResolvedValueOnce({
        data: {
          id: "p1",
          title: "Post",
          replies: [{ count: 1 }],
          likes: [{ count: 2 }],
        },
        error: null,
      });

      await getPost("p1");
      expect(rpcMock).toHaveBeenCalledWith("increment_post_view_count", {
        post_id: "p1",
      });
    });

    it("throws when select fails", async () => {
      rpcMock.mockResolvedValueOnce({ error: null });
      singleMock.mockResolvedValueOnce({
        data: null,
        error: new Error("select error"),
      });
      await expect(getPost("p1")).rejects.toThrow("select error");
    });
  });

  // ---------- getPostReplies ----------
  describe("getPostReplies", () => {
    it("returns replies with pagination", async () => {
      const mockThen = jest.fn().mockImplementation((callback) => {
        const result = Promise.resolve({
          data: [{ id: "r1", author_id: "a" }],
          error: null,
          count: 1,
        });
        return result.then(callback);
      });

      selectMock.mockReturnValueOnce({
        eq: eqMock.mockReturnValue({
          order: orderMock.mockReturnValue({
            range: rangeMock.mockReturnValue({
              then: mockThen,
            }),
          }),
        }),
      });

      await getPostReplies("p1", 1, 10);
      expect(fromMock).toHaveBeenCalledWith("forum_replies");
    });

    it("throws when select errors", async () => {
      const errorMockThen = jest.fn().mockImplementation((callback) => {
        const result = Promise.resolve({
          data: null,
          error: new Error("reply error"),
        });
        return result.then(callback);
      });

      selectMock.mockReturnValueOnce({
        eq: eqMock.mockReturnValue({
          order: orderMock.mockReturnValue({
            range: rangeMock.mockReturnValue({
              then: errorMockThen,
            }),
          }),
        }),
      });

      await expect(getPostReplies("p1")).rejects.toThrow("reply error");
    });
  });

  // ---------- createReply ----------
  describe("createReply", () => {
    it("creates reply and notifies post author", async () => {
      (moderation.checkProfanity as jest.Mock).mockResolvedValue({
        contains_profanity: false,
        censored_text: "",
      });

      singleMock
        .mockResolvedValueOnce({
          data: { id: "r1", post_id: "p1", author_id: "u2" },
          error: null,
        })
        .mockResolvedValueOnce({
          data: { id: "p1", author_id: "u1", title: "Hello" },
          error: null,
        });

      insertMock.mockReturnValue({
        select: jest.fn().mockReturnValue({
          single: singleMock,
        }),
      });

      const reply = await createReply({
        post_id: "p1",
        author_id: "u2",
        content: "hi there",
      });

      expect(reply.id).toBe("r1");
      expect(fromMock).toHaveBeenCalledWith("forum_replies");
    });

    // PASTE THIS INSIDE: describe("createReply", ...);

    it("notifies both post author and parent reply author on a nested reply", async () => {
      const replyData = {
        post_id: "p1",
        author_id: "user3",
        content: "A nested reply",
        parent_reply_id: "r1",
      };
      const postData = { id: "p1", author_id: "user1", title: "Original Post" };
      const parentReplyData = { id: "r1", author_id: "user2" };
      const newReply = { id: "r2", ...replyData };

      // 1. Mock reply creation
      singleMock.mockResolvedValueOnce({ data: newReply, error: null });
      // 2. Mock fetching the post for notification
      singleMock.mockResolvedValueOnce({ data: postData, error: null });
      // 3. Mock fetching the parent reply for notification
      singleMock.mockResolvedValueOnce({ data: parentReplyData, error: null });

      // Mock the insert calls for notifications
      const notificationInsertMock = jest.fn().mockReturnValue({
        then: (cb: any) => Promise.resolve({ error: null }).then(cb),
      });
      fromMock.mockImplementation((tableName) => {
        if (tableName === "notifications") {
          return { insert: notificationInsertMock };
        }
        // Default behavior for other tables
        return {
          insert: jest.fn().mockReturnThis(),
          select: jest.fn().mockReturnValue({
            single: singleMock,
            eq: eqMock.mockReturnThis(),
          }),
        };
      });

      await createReply(replyData);

      // Check that two notifications were created
      expect(notificationInsertMock).toHaveBeenCalledTimes(2);

      // Check notification for post author (user1)
      expect(notificationInsertMock).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ user_id: "user1" })])
      );

      // Check notification for parent reply author (user2)
      expect(notificationInsertMock).toHaveBeenCalledWith(
        expect.arrayContaining([expect.objectContaining({ user_id: "user2" })])
      );
    });

    it("throws when reply insert fails", async () => {
      (moderation.checkProfanity as jest.Mock).mockResolvedValue({
        contains_profanity: false,
        censored_text: "",
      });

      singleMock.mockResolvedValueOnce({
        data: null,
        error: new Error("insert err"),
      });

      await expect(
        createReply({ post_id: "p1", author_id: "u2", content: "hey" })
      ).rejects.toThrow("insert err");
    });
  });

  // ---------- like/unlike post & reply ----------
  describe("like/unlike post & reply", () => {
    it("likes a post", async () => {
      insertMock.mockReturnValue({
        then: jest.fn().mockImplementation((callback) => {
          const result = Promise.resolve({ error: null });
          return result.then(callback);
        }),
      });

      await expect(likePost("p1", "u1")).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith("forum_post_likes");
    });

    it("unlikes a post", async () => {
      deleteMock.mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((callback) => {
          const result = Promise.resolve({ error: null });
          return result.then(callback);
        }),
      });

      await expect(unlikePost("p1", "u1")).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith("forum_post_likes");
    });

    it("likes a reply", async () => {
      insertMock.mockReturnValue({
        then: jest.fn().mockImplementation((callback) => {
          const result = Promise.resolve({ error: null });
          return result.then(callback);
        }),
      });

      await expect(likeReply("r1", "u1")).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith("forum_reply_likes");
    });

    it("unlikes a reply", async () => {
      deleteMock.mockReturnValue({
        eq: jest.fn().mockReturnThis(),
        then: jest.fn().mockImplementation((callback) => {
          const result = Promise.resolve({ error: null });
          return result.then(callback);
        }),
      });

      await expect(unlikeReply("r1", "u1")).resolves.toBeUndefined();
      expect(fromMock).toHaveBeenCalledWith("forum_reply_likes");
    });
  });

  // ---------- user activity & likes queries ----------
  describe("user activity & likes queries", () => {
    it("calculates user activity correctly", async () => {
      const mockThen = jest
        .fn()
        .mockImplementationOnce((callback) =>
          Promise.resolve({ count: 2, error: null }).then(callback)
        )
        .mockImplementationOnce((callback) =>
          Promise.resolve({ count: 4, error: null }).then(callback)
        )
        .mockImplementationOnce((callback) =>
          Promise.resolve({ data: [{ id: "p1" }], error: null }).then(callback)
        )
        .mockImplementationOnce((callback) =>
          Promise.resolve({ data: [{ id: "r1" }], error: null }).then(callback)
        )
        .mockImplementationOnce((callback) =>
          Promise.resolve({ count: 5, error: null }).then(callback)
        )
        .mockImplementationOnce((callback) =>
          Promise.resolve({ count: 3, error: null }).then(callback)
        );

      const queryBuilder = {
        eq: jest.fn().mockReturnThis(),
        in: jest.fn().mockReturnThis(),
        then: mockThen,
      };
      selectMock.mockReturnValue(queryBuilder);

      const stats = await getUserActivity("u1");
      expect(stats.postsCreated).toBe(2);
      expect(stats.replies).toBe(4);
    });

    it("checkUserLikedPost & checkUserLikedReply return boolean", async () => {
      singleMock
        .mockResolvedValueOnce({ data: { id: "like1" }, error: null })
        .mockResolvedValueOnce({ data: null, error: null });

      const likedPost = await checkUserLikedPost("p1", "u1");
      expect(likedPost).toBe(true);

      const likedReply = await checkUserLikedReply("r1", "u1");
      expect(likedReply).toBe(false);
    });

    it("getUserPostLikes & getUserReplyLikes return arrays", async () => {
      const mockThen = jest
        .fn()
        .mockImplementationOnce((callback) => {
          const result = Promise.resolve({
            data: [{ post_id: "p1" }, { post_id: "p2" }],
            error: null,
          });
          return result.then(callback);
        })
        .mockImplementationOnce((callback) => {
          const result = Promise.resolve({
            data: [{ reply_id: "r1" }],
            error: null,
          });
          return result.then(callback);
        });

      selectMock.mockReturnValue({
        eq: eqMock.mockReturnValue({
          then: mockThen,
        }),
      });

      const posts = await getUserPostLikes("u1");
      expect(posts).toEqual(["p1", "p2"]);

      const replies = await getUserReplyLikes("u1");
      expect(replies).toEqual(["r1"]);
    });
  });

  // ---------- notifications ----------
  describe("notifications", () => {
    describe("createNotification", () => {
      it("creates a notification successfully", async () => {
        insertMock.mockReturnValue({
          then: jest.fn().mockImplementation((callback) => {
            const result = Promise.resolve({ error: null });
            return result.then(callback);
          }),
        });

        await expect(
          createNotification({
            user_id: "u1",
            type: "reply",
            source_id: "s1",
            source_type: "reply",
            message: "msg",
          })
        ).resolves.toBeUndefined();

        expect(fromMock).toHaveBeenCalledWith("notifications");
      });
    });

    describe("getUserNotifications", () => {
      it("gets user notifications with pagination", async () => {
        const mockThen = jest.fn().mockImplementation((callback) => {
          const result = Promise.resolve({
            data: [{ id: "n1" }],
            count: 1,
            error: null,
          });
          return result.then(callback);
        });

        selectMock.mockReturnValue({
          eq: eqMock.mockReturnValue({
            order: orderMock.mockReturnValue({
              range: rangeMock.mockReturnValue({
                then: mockThen,
              }),
            }),
          }),
        });

        const res = await getUserNotifications("u1", 10, 1);
        expect(res.notifications.length).toBe(1);
      });

      it("throws an error when fetching notifications fails", async () => {
        const mockThen = jest.fn().mockImplementation((callback) => {
          const result = Promise.resolve({
            data: null,
            count: 0,
            error: new Error("fetch error"),
          });
          return result.then(callback);
        });

        selectMock.mockReturnValue({
          eq: eqMock.mockReturnValue({
            order: orderMock.mockReturnValue({
              range: rangeMock.mockReturnValue({
                then: mockThen,
              }),
            }),
          }),
        });

        await expect(getUserNotifications("u1")).rejects.toThrow("fetch error");
      });
    });

    describe("markNotificationAsRead", () => {
      it("marks a single notification as read", async () => {
        await expect(markNotificationAsRead("n1")).resolves.toBeUndefined();
        expect(fromMock).toHaveBeenCalledWith("notifications");
        expect(updateMock).toHaveBeenCalledWith({ is_read: true });
        expect(eqMock).toHaveBeenCalledWith("id", "n1");
      });

      it("throws an error if the update fails", async () => {
        updateMock.mockReturnValue({
          eq: eqMock,
          then: jest.fn().mockImplementation((callback) => {
            const result = Promise.resolve({ error: new Error("update fail") });
            return result.then(callback);
          }),
        });

        await expect(markNotificationAsRead("n1")).rejects.toThrow(
          "update fail"
        );
      });
    });

    describe("markAllNotificationsAsRead", () => {
      it("marks all of a user's unread notifications as read", async () => {
        await expect(markAllNotificationsAsRead("u1")).resolves.toBeUndefined();
        expect(fromMock).toHaveBeenCalledWith("notifications");
        expect(updateMock).toHaveBeenCalledWith({ is_read: true });
        expect(eqMock).toHaveBeenCalledWith("user_id", "u1");
        expect(eqMock).toHaveBeenCalledWith("is_read", false);
      });

      it("throws an error if the update fails", async () => {
        updateMock.mockReturnValue({
          eq: eqMock,
          then: jest.fn().mockImplementation((callback) => {
            const result = Promise.resolve({
              error: new Error("mass update fail"),
            });
            return result.then(callback);
          }),
        });

        await expect(markAllNotificationsAsRead("u1")).rejects.toThrow(
          "mass update fail"
        );
      });
    });

    // FIXED: Tests for getUnreadNotificationCount
    describe("getUnreadNotificationCount", () => {
      it("returns the count of unread notifications", async () => {
        const mockThen = jest.fn().mockImplementation((callback) => {
          const result = Promise.resolve({ count: 5, error: null });
          return result.then(callback);
        });

        // This query builder allows for chainable .eq() calls
        const queryBuilder = {
          eq: jest.fn().mockReturnThis(),
          then: mockThen,
        };
        selectMock.mockReturnValue(queryBuilder);

        const count = await getUnreadNotificationCount("u1");
        expect(count).toBe(5);
        expect(fromMock).toHaveBeenCalledWith("notifications");
        expect(selectMock).toHaveBeenCalledWith("*", { count: "exact" });
        expect(queryBuilder.eq).toHaveBeenCalledWith("user_id", "u1");
        expect(queryBuilder.eq).toHaveBeenCalledWith("is_read", false);
      });

      it("returns 0 if count is null", async () => {
        const mockThen = jest.fn().mockImplementation((callback) => {
          const result = Promise.resolve({ count: null, error: null });
          return result.then(callback);
        });

        const queryBuilder = {
          eq: jest.fn().mockReturnThis(),
          then: mockThen,
        };
        selectMock.mockReturnValue(queryBuilder);

        const count = await getUnreadNotificationCount("u1");
        expect(count).toBe(0);
      });

      it("throws an error if fetching the count fails", async () => {
        const mockThen = jest.fn().mockImplementation((callback) => {
          const result = Promise.resolve({
            count: null,
            error: new Error("count error"),
          });
          return result.then(callback);
        });

        const queryBuilder = {
          eq: jest.fn().mockReturnThis(),
          then: mockThen,
        };
        selectMock.mockReturnValue(queryBuilder);

        await expect(getUnreadNotificationCount("u1")).rejects.toThrow(
          "count error"
        );
      });
    });
  });

 describe("like/reply query error handling", () => {
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  function createChainableSingleMock(result: any) {
    return {
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue(result),
    };
  }

  // Replace the old test with this corrected version

it("checkUserLikedReply should return false on database error", async () => {
  // Mock the .single() call to REJECT the promise, simulating a critical failure
  singleMock.mockRejectedValue(new Error("DB Connection Failed"));

  const result = await checkUserLikedReply("r1", "u1");

  // Expect the function's catch block to handle the rejection and return false
  expect(result).toBe(false);
  
  // Now that the catch block is triggered, this assertion will pass
  expect(console.error).toHaveBeenCalledWith(
    "Error checking reply like:",
    expect.any(Error)
  );
});

  it("getUserPostLikes should return an empty array on database error", async () => {
    selectMock.mockReturnValue({
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((cb) =>
        Promise.resolve({
          data: null,
          error: new Error("Query Failed"),
        }).then(cb)
      ),
    });

    const result = await getUserPostLikes("u1");

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error getting user post likes:",
      expect.any(Error)
    );
  });

  it("getUserReplyLikes should return an empty array on database error", async () => {
    selectMock.mockReturnValue({
      eq: jest.fn().mockReturnThis(),
      then: jest.fn().mockImplementation((cb) =>
        Promise.resolve({
          data: null,
          error: new Error("Query Failed"),
        }).then(cb)
      ),
    });

    const result = await getUserReplyLikes("u1");

    expect(result).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error getting user reply likes:",
      expect.any(Error)
    );
  });
});

// PASTE THESE describe BLOCKS INTO YOUR TEST FILE

// --- Tests for fetchPostsByUserInterests ---
describe("fetchPostsByUserInterests error handling", () => {
  it("throws when fetching course tags fails", async () => {
    const dbError = new Error("Failed to fetch course tags");
    // 1. Mock user courses to succeed
    selectMock.mockReturnValueOnce({
      eq: eqMock.mockReturnValue({
        then: (cb:any) =>
          Promise.resolve({ data: [{ course_id: "c1" }], error: null }).then(
            cb
          ),
      }),
    });
    // 2. Mock course tags to fail
    selectMock.mockReturnValueOnce({
      in: jest.fn().mockReturnValue({
        then: (cb:any) => Promise.resolve({ data: null, error: dbError }).then(cb),
      }),
    });

    await expect(fetchPostsByUserInterests("u1")).rejects.toThrow(
      "Failed to fetch course tags"
    );
  });
});

// --- Tests for like/unlike functions ---
describe("like/unlike error handling", () => {
  it("likePost throws on database error", async () => {
    insertMock.mockReturnValue({
      then: (cb:any) =>
        Promise.resolve({ error: new Error("Insert failed") }).then(cb),
    });
    await expect(likePost("p1", "u1")).rejects.toThrow("Insert failed");
  });

  // Replace the old 'unlikePost' test with this one
it("unlikePost throws on database error", async () => {
  const dbError = new Error("Delete failed");
  const mockThen = (cb:any) => Promise.resolve({ error: dbError }).then(cb);

  // This query builder allows for chainable .eq() calls
  const queryBuilder = {
    eq: jest.fn().mockReturnThis(), // .eq() returns itself, allowing .eq().eq()
    then: mockThen,                 // The final await resolves here
  };

  deleteMock.mockReturnValue(queryBuilder);

  await expect(unlikePost("p1", "u1")).rejects.toThrow("Delete failed");
});

// Replace the old 'unlikeReply' test with this one
it("unlikeReply throws on database error", async () => {
  const dbError = new Error("Delete failed");
  const mockThen = (cb:any) => Promise.resolve({ error: dbError }).then(cb);

  // Use the same chainable query builder pattern
  const queryBuilder = {
    eq: jest.fn().mockReturnThis(),
    then: mockThen,
  };

  deleteMock.mockReturnValue(queryBuilder);

  await expect(unlikeReply("r1", "u1")).rejects.toThrow("Delete failed");
});
  it("likeReply throws on database error", async () => {
    insertMock.mockReturnValue({
      then: (cb:any) =>
        Promise.resolve({ error: new Error("Insert failed") }).then(cb),
    });
    await expect(likeReply("r1", "u1")).rejects.toThrow("Insert failed");
  });

});

// --- Tests for getUserActivity ---
describe("getUserActivity error handling", () => {
  it("throws if fetching postsCreated fails", async () => {
    const dbError = new Error("Post count failed");
    selectMock.mockReturnValueOnce({
      eq: eqMock.mockReturnValue({
        then: (cb:any) => Promise.resolve({ count: null, error: dbError }).then(cb),
      }),
    });
    await expect(getUserActivity("u1")).rejects.toThrow("Post count failed");
  });

  it("throws if fetching replies count fails", async () => {
    const dbError = new Error("Reply count failed");
    // Mock first call (posts) to succeed
    selectMock.mockReturnValueOnce({
      eq: eqMock.mockReturnValue({
        then: (cb:any) => Promise.resolve({ count: 5, error: null }).then(cb),
      }),
    });
    // Mock second call (replies) to fail
    selectMock.mockReturnValueOnce({
      eq: eqMock.mockReturnValue({
        then: (cb:any) => Promise.resolve({ count: null, error: dbError }).then(cb),
      }),
    });
    await expect(getUserActivity("u1")).rejects.toThrow("Reply count failed");
  });
});

// --- Tests for getTrendingTopics ---
describe("getTrendingTopics error handling", () => {
  let consoleErrorSpy: jest.SpyInstance;
  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });
  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  it("returns an empty array on database error", async () => {
    const dbError = new Error("Tags fetch failed");
    selectMock.mockReturnValueOnce({
      then: (cb:any) => Promise.resolve({ data: null, error: dbError }).then(cb),
    });

    const topics = await getTrendingTopics();
    expect(topics).toEqual([]);
    expect(console.error).toHaveBeenCalledWith(
      "Error fetching posts for trending topics:",
      dbError
    );
  });
});

// --- Tests for createNotification ---
describe("createNotification error handling", () => {
  it("throws an error if notification insert fails", async () => {
    const dbError = new Error("Notification insert failed");
    insertMock.mockReturnValue({
      then: (cb:any) => Promise.resolve({ error: dbError }).then(cb),
    });
    await expect(
      createNotification({
        user_id: "u1",
        type: "test",
        source_id: "s1",
        source_type: "test",
        message: "test",
      })
    ).rejects.toThrow("Notification insert failed");
  });
});
});
