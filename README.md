# sys-band

Claude Code 입력창 바로 위에 남은 사용량, 디스크, 메모리를 한 줄로 늘 띄워 주는 모드입니다.

```
사용량 5시간 77% 남음 · 7일 59% 남음  │  디스크 9.0/252.0G (4%)  │  메모리 0.5/15.7G (3%)  [숨기기]
```

- 사용량: 5시간·7일 한도 중 남은 비율 (응답마다 갱신)
- 디스크·메모리: 15초마다 갱신
- `/sysband` 로 숨기기/다시 켜기

## 설치

터미널 세션의 입력창에서:

```
/plugin install sys-band --marketplace ihnhoian/claude-sysband
```

`Add marketplace?` 에 `y`, 범위는 user 를 고르면 이후 모든 세션에서 켜집니다.

셸에서:

```
claude plugin install sys-band --marketplace ihnhoian/claude-sysband
```

데스크톱 앱에서 `/plugin` 이 안 될 때: 입력창 옆 + → Plugins → Add marketplace 에 `ihnhoian/claude-sysband` → Add plugin.
