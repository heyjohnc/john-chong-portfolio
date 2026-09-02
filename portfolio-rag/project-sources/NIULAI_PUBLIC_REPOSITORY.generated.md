---
document_id: niulai-public-repository
version: 1.0.0
status: synced-public-source
last_updated: 2026-09-02
source_url: https://github.com/heyjohnc/niulai-shengmi-squad/tree/9489e1ff4710351ce5eba11f33790e4241b293ff
source_revision: 9489e1ff4710351ce5eba11f33790e4241b293ff
---

# heyjohnc/niulai-shengmi-squad — Approved Public Repository Snapshot

Synced from the allowlisted public repository at commit `9489e1ff4710351ce5eba11f33790e4241b293ff` on 2026-09-02T23:36:42.100Z.
Only the explicitly selected public Markdown ranges below enter Ask John's evidence index.

## NL-01 — Niulai public repository overview

**一个完全离线、确定性、只读的四 Agent 市场剧情参考实现：票先冻结，模型后接话，所有结果只在纸面发生。**

本仓库是从零编写、拥有独立 Git 历史的 clean-room public reference。它演示一条完整纵向切片：synthetic market snapshot → 云雀候选卡 → `FACT / INFERENCE / OPEN_QUESTION` → 四人独立 50% `RANDOM_ONLY` `BUY/PASS` → 3/4 决议 → `PAPER_ONLY` 开仓 → 确定性价格轨迹 → TP 或 SL → 四角色本地 fallback → canonical single timeline → GET-only API → 浏览器 UI。

另有一个不足三票、不开仓、先跌后拉的观察/回旋镖 fixture，以及一个只能使用 injected fake transport 的 execution-safety-lab。

当前版本为 `v0.2.1 / PUBLIC_REFERENCE_RELEASED`。公开参考仓与实际运行系统严格分离；线上只读产品入口是 [niulaishengmi.lol](https://niulaishengmi.lol)，该网站不是由本仓代码部署，也不能作为本仓 fixture/fake 测试的生产证明。

完整工程事实、企业证据和正式运行实现保留在独立的 private 权威仓中。本 public clean-room reference 不会同步 signer、钱包、真实交易执行、社交发布器、账号绑定、原始时间线、provider 回执或私人运维配置；后续只按里程碑发布可以独立复核的脱敏设计与聚合证据。

## NL-02 — Niulai public architecture summary

```text
deterministic synthetic generator
  → sourced candidate + three claim types
  → four independent frozen RANDOM_ONLY votes
  → deterministic 3-of-4 resolution
  → paper position or observation-only branch
  → deterministic price path and TP/SL/boomerang
  → provider-neutral role contract or local fallback
  → canonical append-only timeline
  → public-field projection
  → GET-only local API
  → read-only responsive browser UI

injected fake transport
  → single-writer + atomic revision state
  → success / confirmed revert / pending / ambiguous
  → one same-snapshot retry only after confirmed revert
  → closed or fail-closed manual review
```

主要目录：

- `src/core/`：确定性候选、随机票、纸面生命周期、公共投影与单时间线。
- `src/model/`：provider-neutral request/output contract、角色隔离、超时、Schema 校验和本地 fallback。
- `src/execution-safety-lab/`：只接受 injected fake transport 的安全状态机。
- `src/server.mjs`：只绑定 loopback 的 GET-only API 与静态 UI。
- `fixtures/`：由本仓代码从零确定性生成的公开 fixture。
- `scripts/validate.mjs`：fixture、权限、安全实验室和公开扫描门。
- `public/`：无框架、无第三方图片、原创 SVG 的响应式只读界面。

详见 [架构说明](docs/ARCHITECTURE.md) 和 [验证说明](docs/VERIFICATION.md)。

## NL-03 — Niulai public claim states

| 轴 | 当前状态 |
| --- | --- |
| `CODE_PRESENT` | 本地参考实现、API、UI、fixture generator 与 fake safety lab 存在 |
| `TESTED(FIXTURE/FAKE_TRANSPORT)` | 自动测试和 validate 仅证明 fixture/fake 行为 |
| `PUBLIC_REFERENCE_RELEASED` | GitHub public visibility 已由 Owner 明确授权，匿名网页/API/Raw/Actions 访问已验证 |
| `SANITIZED_RUNTIME_AGGREGATE` | 只证明公开快照中的汇总数字与披露边界；原始数据未公开，不能独立重算 |
| `FAN_REWARD_GOVERNANCE_DESIGN` | `DOCUMENTED_ONLY`；broader action-locked preparation layer 的实现状态仅作清晰标注，不能从本仓独立复现 |
| `DEPLOYED_DEMO` | `NOT_VALIDATED` |
| `LIVE_READ_ONLY_VALIDATED` | `NOT_VALIDATED` |
| `NOT_VALIDATED` | 生产、真实市场、真实资金、真实社交、真实用户、收益、商业影响 |

这些状态互不推导：代码存在不代表部署，fixture 通过不代表 live validation，private staging 也不代表 public release。

## NL-04 — Niulai owner and Agent contribution boundary

Owner 定义了产品名称、四角色、随机投票、纸面模式、公开/私有分离、安全实验室与发布门。本仓实现、测试、文档和审计由开发 Agent 在这些边界内辅助完成。Owner 已明确批准本 public reference 的 GitHub 可见性；这项批准不等于对生产、真实资金、用户采用或商业结果作出验收声明。

详见 [Case Study](docs/CASE_STUDY.md)、[限制](docs/LIMITATIONS.md)、[贡献指南](CONTRIBUTING.md) 与 [安全政策](SECURITY.md)。

## NL-05 — Niulai failure and recovery evidence

实现期间出现过三个有代表性的本地失败：

- 初版 fixture seed 没有达到预期 3/4。处理方式是用只读搜索找到满足目标分支的 seed，并把 generator 自检保留为硬断言；fixture 不会因为错误 seed 静默变成另一条故事。
- 初版脚本把 `fileURLToPath` 从错误的内置模块导入，生成命令立即失败。修正 import 后重新生成 fixture 与 demo。这个失败发生在任何提交或发布前，没有外部副作用。
- 首次浏览器验收发现静态文件 `Buffer` 被通用 JSON responder 序列化，状态码与 CSP 测试因此曾误判页面可用。修正为直接发送 binary/string body，并新增 HTML 正文与 content-type 回归测试后，桌面和移动浏览器复验通过。

这些失败说明本仓的验证重点不只是 happy path：生成器必须证明 fixture shape，状态机必须对 ambiguous/pending 不重试，API 必须拒绝 write method，public projection 必须证明私有字段被移除。

## NL-06 — Niulai reproducible verification

- 恰好四个 stable Agent，四人各一票。
- 同 seed 的四个 50% draw 可重放，候选字段不参与 vote。
- 3/4 threshold 产生 `PAPER_BUY`；不足三票产生 `OBSERVE_ONLY`。
- TP、SL 和 observation boomerang 三条 fixture 均可确定性重建。
- candidate evidence 包含三种 claim type、source、observed time 和 freshness。
- model request 只能在 vote finalized 后构建。
- provider-neutral output 做角色、字段、claim 和 source validation。
- 无 provider、timeout 和 invalid output 均走角色隔离 local fallback。
- public projection 删除私有字段。
- GET API 拒绝 POST 和非 allowlisted static path。
- fake lab 覆盖 success、revert、pending、ambiguous、one retry、nonzero exposure、single writer 和 atomic revision。
- security scan 检查 tracked/candidate path allowlist 与敏感类别。
- asset allowlist 仅接受仓内原创 `public/mark.svg`，并拒绝 public 文件中的远程或 data-URI 媒体。
- documentation-only fan-reward disclosure 继续经过相同 security scan，不得包含 private path、真实 chain address、长 transaction-style identifier、credential material 或 live mutation primitive。

## NL-07 — Niulai public limitations

## Deliberate product limits

- 数据全部 synthetic、deterministic、fixture-only。
- 价格使用整数 index，不模拟真实流动性、税、滑点、延迟或成交。
- 纸面 notional 没有货币含义，不代表真实仓位或收益。
- 只有一个候选、一个纸面仓和有限事件类型的参考纵向切片。
- 本地角色 fallback 是演示文案，不是通用对话模型质量证明。
- provider-neutral contract 没有连接任何 provider，也没有验证真实 provider latency、cost 或 availability。
- safety lab 只验证 injected fake transport 状态转换，不验证链上、钱包或交易客户端。
- UI 是只读 reference，不包含身份、权限管理或多人协作。
- 粉丝贡献奖励目前在本 public repo 中只有设计披露；没有 proposal/round/plan 实现、真实贡献输入、社区投票产品或付款执行器。

## Evidence limits

- 没有 `DEPLOYED_DEMO` 证据。
- 没有 `LIVE_READ_ONLY_VALIDATED` 证据。
- 只有日期化脱敏运行聚合，没有原始市场、资金、社交渠道或真实用户证据。
- 没有可靠性 SLA、性能基准、成本账单、用户研究、采用、收入或商业结果。
- Owner 只批准了 public reference 可见性；没有对生产、资金、用户采用或商业结果作验收。
- broader project 对 action-locked fan-reward preparation layer 的实现声明不能从本 public repo 独立复现，也不是 real-chain payout evidence。

## Legal and content limits

仓库只包含自有代码、文字和原创 SVG。它不提供第三方角色、电影、商标、UGC 或资产的许可，也不判断某种粉丝使用在特定司法辖区是否合法。参见 `THIRD_PARTY_CONTENT.md`。

## Security limits

denylist scan 是 defense in depth，不是秘密扫描产品或独立安全审计。它会阻止本项目明确禁止的高风险类别，但不能证明任何任意未来改动都没有漏洞。

本地 server 只绑定 loopback；若使用者自行改变绑定地址、加入 proxy、provider、wallet 或写 API，就超出本仓验证和许可声明范围，需要新的 threat model、权限设计和测试。

粉丝奖励从 documentation-only 进入真实执行还需要 final policy、受保护 signer/provider、exactly-once journal、nonce ownership、逐 receipt reconcile、partial-success recovery、stop control 和 separately authorized low-value UAT。仅添加一个 key file 或签名函数不满足这些条件。
