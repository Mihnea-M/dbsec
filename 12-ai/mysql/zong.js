import ZongJi from '@vlasky/zongji';

const zongji = new ZongJi({
  host: '127.0.0.1',
  user: 'replica_user',
  password: 'replica_pass',
});

zongji.on('binlog', (evt) => {
  console.log(`[BINLOG] ${evt.getEventName()}`);
});

zongji.on('ready', () => {
  console.log("✅ ZongJi ready");
});

zongji.start({
  serverId: 123,
  startAtEnd: true,
  includeEvents: ['tablemap', 'writerows', 'updaterows', 'deleterows'],
  includeSchema: {
    testdb: true
  }
});
