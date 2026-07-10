# NonogramSolver.ts 性能改善 タスク計画

計画本体: `/Users/wmoai/.claude/plans/tranquil-prancing-lobster.md`

## タスク

1. [x] lineSolver.ts: DPライン解法のテストを書く（Red）
2. [x] lineSolver.ts: DPライン解法を実装する（Green）
3. [x] lineSolver.ts を /simplify でレビューする（Refactor）
4. [x] NonogramSolver.test.ts: 既存挙動の回帰テストを書く
5. [x] NonogramSolver.ts をlineSolver利用に置換
6. [x] backtrackに伝播(propagate)を組み込む
7. [x] 性能回帰テストを追加し最終検証（npm run test:run / npm run lint / npm run build / 手動ベンチマーク）

## 結果

- 元々3分以上ハングしていた15x15低密度盤面が、伝播組み込み後は約165msで解けるようになった
- 15x15は概ね数十ms〜5秒程度に収まる（一部ばらつきあり）
- **既知の制限事項**: 20x20の低密度盤面では、依然として数十秒かかるケースが残る（原因: セル選択が左上から順のままで、最も自由度の少ない行/列を優先するMRVヒューリスティックが未実装）。ユーザー判断により、今回のスコープでは対応せず「現状のまま完了」とした。将来20x20の性能が問題になった場合はMRV導入を検討する。
- vitestの`globals: true`設定に対応する型定義が不足しており（テストファイルがこれまで一つもなかったため露見していなかった）、`tsconfig.json`に`"types": ["vitest/globals"]`を追加して修正した

## スコープ外

- `example()` の import時自動実行（副作用）の修正
- `solver_old.ts` / `solver_2old.ts` の削除・整理
- MRVヒューリスティックによる20x20のさらなる高速化（ユーザー判断によりスキップ）
