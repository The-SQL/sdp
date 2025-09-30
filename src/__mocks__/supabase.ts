export type QueryResult = { data: unknown; error: unknown };

export function makeSupabaseMock(options: {
  insertSelect?: QueryResult;
  selectEq?: QueryResult;
}) {
  const selectAfterInsert = jest
    .fn()
    .mockResolvedValue(options.insertSelect ?? { data: null, error: null });

  const insert = jest.fn().mockReturnValue({ select: selectAfterInsert });

  const order = jest.fn().mockReturnThis();
  const limit = jest.fn().mockReturnThis();
  const range = jest.fn().mockReturnThis();
  const inFn = jest.fn().mockReturnThis();
  const or = jest.fn().mockReturnThis();
  const contains = jest.fn().mockReturnThis();

  const single = jest
    .fn()
    .mockResolvedValue(options.selectEq ?? { data: null, error: null });
  const maybeSingle = jest
    .fn()
    .mockResolvedValue(options.selectEq ?? { data: null, error: null });

  // THIS IS THE FULL CHAIN OBJECT
  const chain = {
    eq: jest.fn().mockReturnThis(),
    order,
    limit,
    range,
    single,
    maybeSingle,
    select: jest.fn().mockReturnThis(),
    in: inFn,
    or,
    contains,
  };

  // Patch select and eq to return the full chain
  chain.select = jest.fn().mockReturnValue(chain);
  chain.eq = jest.fn().mockReturnValue(chain);

  const update = jest.fn().mockImplementation(() => ({
    eq: () => ({
      select: selectAfterInsert,
    }),
  }));

  const deleteEq = jest.fn().mockResolvedValue({ error: null });
  const deleteFn = jest.fn().mockReturnValue({ eq: deleteEq });

  const upload = jest.fn().mockResolvedValue({ error: null });
  const getPublicUrl = jest
    .fn()
    .mockReturnValue({ data: { publicUrl: "mock-url" } });
  const fromStorage = jest.fn().mockReturnValue({ upload, getPublicUrl });
  const storage = { from: fromStorage };

  const from = jest.fn().mockReturnValue({
    insert,
    select: chain.select,
    update,
    eq: chain.eq,
    in: inFn,
    or,
    contains,
    order,
    limit,
    range,
    delete: deleteFn,
    storage,
  });

  const client = { from, storage, rpc: jest.fn().mockResolvedValue({}) };

  return {
    client,
    from,
    insert,
    update,
    select: chain.select,
    eq: chain.eq,
    single,
    maybeSingle,
    order,
    limit,
    range,
    inFn,
    or,
    contains,
    deleteFn,
    deleteEq,
    storage,
    selectAfterInsert,
  };
}
