## 2.10.0-rc.70 (2025-02-20)

No changes.

## 2.10.0-rc.69 (2025-02-19)

### Fixed (1 change)

- [fix: set max height with vh instead of element.clientHeight](kchat/webapp@2edb2d39a1bfe46a47f906d12fbcb479c8c43523) by @boris.trombert ([merge request](kchat/webapp!1017))

### Removed (1 change)

- [removed unnecessary websocket logs](kchat/webapp@727d9ae10091dc15b22675c5763d2b52ecd2bdd8) by @dimitar.slaev ([merge request](kchat/webapp!1016))

## 2.10.0-rc.68 (2025-02-18)

### Fixed (1 change)

- [Fixed: Emojis zoom out on hover.](kchat/webapp@b2b08d853ee0120bde1db3812a16efc0647035cf) by @andy.lerandy ([merge request](kchat/webapp!1014))

## 2.10.0-rc.67 (2025-02-18)

No changes.

## 2.10.0-rc.66 (2025-02-17)

### Fixed (1 change)

- [Updated: Reduced number of calls on startup.](kchat/webapp@d7f2221482224033196afa8693710dfb8f1abe83) by @andy.lerandy ([merge request](kchat/webapp!1010))

## 2.10.0-rc.65 (2025-02-13)

### Changed (1 change)

- [Fix missing messages on reconnect](kchat/webapp@2a0764380fb0216318e26f2556bc99eb727ae649) by @dimitar.slaev ([merge request](kchat/webapp!1009))

## 2.10.0-rc.64 (2025-02-05)

### Fixed (1 change)

- [revert all changes except binding channels synchronously](kchat/webapp@0859c4eee982d9c65dc91c3347404fc63907a8c6) by @dimitar.slaev ([merge request](kchat/webapp!1006))

## 2.10.0-rc.63 (2025-02-03)

### Changed (1 change)

- [improve logs to debug syncro bugs](kchat/webapp@cdee4f5636ac84e19327cbe50bb3907b7e3a8611) by @dimitar.slaev ([merge request](kchat/webapp!1005))

## 2.10.0-rc.62 (2025-02-03)

### change (1 change)

- [revert: redirect team when 404](kchat/webapp@45c9412876667a9e0a4ead963af392787f317baf) by @dimitar.slaev ([merge request](kchat/webapp!1004))

## 2.10.0-rc.61 (2025-01-30)

### Fixed (2 changes)

- [delete team from desktop list when 404](kchat/webapp@0479cbdb42585e30b3b68dd725dc0a3689afb957) by @boris.trombert ([merge request](kchat/webapp!999))
- [update desktop cache when reconnecting ws](kchat/webapp@ea324e3751f664e69f85ac98ad7a9b1e09012fb5) by @boris.trombert ([merge request](kchat/webapp!999))

## 2.10.0-rc.60 (2025-01-29)

### Fixed (7 changes)

- [Fix receiving double notifications](kchat/webapp@e07cc70c8b9679d81674fccfcd6f1ce5081137a6) by @dimitar.slaev ([merge request](kchat/webapp!994))
- [Fixed: Inline Text set as table.](kchat/webapp@6df2a19067e3ad5d2c77107d82884c67e5d76659) by @andy.lerandy ([merge request](kchat/webapp!998))
- [Fixed: Viewport of kdrive svg for file preview.](kchat/webapp@f76294b09a318b185f9af12ffc31c448950a1887) by @andy.lerandy ([merge request](kchat/webapp!997))
- [Fixed: Missing translation.](kchat/webapp@e018ca5b90f4a3f905f6aaa096a16f7356388424) by @andy.lerandy ([merge request](kchat/webapp!995))
- [redirect to default team when 404 on reconnect and loadMe](kchat/webapp@d1bca23b33e79d6df79d18514b1456c99260fd06) by @dev_bot ([merge request](kchat/webapp!990))
- [redirect to default team when 404 on reconnect and loadMe](kchat/webapp@92c518094689cc4a908ba36bcb0bdf696101c502) by @dev_bot ([merge request](kchat/webapp!990))
- [remove old calendar emoji to avoid duplication](kchat/webapp@25e0771950978aabdf6c5f76e9fd288627ccbd00) by @cyril.gromoff ([merge request](kchat/webapp!939))

## 2.10.0-rc.59 (2025-01-23)

### Fixed (3 changes)

- [Fixed: Missing translation.](kchat/webapp@e018ca5b90f4a3f905f6aaa096a16f7356388424) by @andy.lerandy ([merge request](kchat/webapp!995))
- [Removed: Duplicated important button.](kchat/webapp@a1cb1a202ec81e5232bbe9042d4915137f1ac8a1) by @andy.lerandy ([merge request](kchat/webapp!993))
- [Fixed: Untranslated button & broken ellipsis.](kchat/webapp@0d06efe8ff2f999589fc0aaaaab19390bc13f671) by @andy.lerandy ([merge request](kchat/webapp!992))

## 2.10.0-rc.58 (2025-01-23)

### Fixed (1 change)

- [Fixed: Untranslated button & broken ellipsis.](kchat/webapp@0d06efe8ff2f999589fc0aaaaab19390bc13f671) by @andy.lerandy ([merge request](kchat/webapp!992))

## 2.10.0-rc.57 (2025-01-23)

No changes.

## 2.10.0-rc.56 (2025-01-22)

No changes.

## 2.10.0-rc.55 (2025-01-22)

### Fixed (2 changes)

- [sound notifications works properly when there are attachement with texts messages](kchat/webapp@1a1fac4599ee74b8c27f81b85141384a1cdb8294) by @cyril.gromoff ([merge request](kchat/webapp!949))
- [Ensure post actions close when focus is lost](kchat/webapp@2d03851c5b25679e553f79298da1687e4fb3380e) by @dimitar.slaev ([merge request](kchat/webapp!982))

## 2.10.0-rc.54 (2025-01-22)

### Fixed (4 changes)

- [fix kdrive import button click handler](kchat/webapp@33b03b07172ecd8913ee431ac37da5149e34c1c9) by @antonbuksa ([merge request](kchat/webapp!991))
- [Fixed: Duplicated keys in component array.](kchat/webapp@da2f277eaddc551b71192739de62c44c2c839167) by @andy.lerandy ([merge request](kchat/webapp!937))
- [remove multiple instances of the same date separator in saved messages](kchat/webapp@5976ae806db349fb0032d6989bb910660cb85d8f) by @cyril.gromoff ([merge request](kchat/webapp!937))
- [Ensure post actions close when focus is lost](kchat/webapp@2d03851c5b25679e553f79298da1687e4fb3380e) by @dimitar.slaev ([merge request](kchat/webapp!982))

## 2.10.0-rc.53 (2025-01-21)

### Fixed (1 change)

- [Fixed: Duplicated keys in component array.](kchat/webapp@54a23db0b2fc84756f7c0268db5e4d3aeb22af16) by @andy.lerandy ([merge request](kchat/webapp!989))

## 2.10.0-rc.52 (2025-01-21)

### Fixed (2 changes)

- [Fixed: Incorrect z-index for `new_replies_banner`.](kchat/webapp@0738d1ba82b4b696725821165a6e062ce32ece96) by @andy.lerandy ([merge request](kchat/webapp!988))
- [Fixed: Missing translation keys.](kchat/webapp@0dba7b72c821304aecae3d8c80446c61d2f42925) by @andy.lerandy ([merge request](kchat/webapp!987))

## 2.10.0-rc.51 (2025-01-14)

### Chore (1 change)

- [clean eslint errors in announcement bar](kchat/webapp@8d984ab4cd40243f94347258d1634dad747220f0) by @antonbuksa

## 2.10.0-rc.50 (2025-01-14)

### Chore (1 change)

- [build(deps): bump ksuite bridge version to 0.3.6](kchat/webapp@39d70ac02fe0724db2ff625e90115f5e1c25ed54) by @charbel.naoum ([merge request](kchat/webapp!986))

### change (1 change)

- [FIx post input width in center mode](kchat/webapp@46bf456fa0f37d23b97e4629bae60fecae750459) by @dimitar.slaev ([merge request](kchat/webapp!985))

## 2.10.0-rc.49 (2025-01-13)

### Fixed (1 change)

- [Hide text input if sending a voice message](kchat/webapp@6645f9e676037ef963c2d2b0ccc620579bf1c69d) by @dimitar.slaev ([merge request](kchat/webapp!983))

### Changed (1 change)

- [upload menu refactor](kchat/webapp@e43981a7c2435d10a38e402d8676bb498a1b5942) by @antonbuksa ([merge request](kchat/webapp!984))

## 2.10.0-rc.48 (2025-01-08)

### Fixed (4 changes)

- [disable schedule message for audio type messages](kchat/webapp@342eba6b9bbcade0c2f426bbbe4dc5fc24b8164d) by @boris.trombert ([merge request](kchat/webapp!978))
- [change reminder to 8am instead of 9am](kchat/webapp@dad23dd8edcbf51e0de859411fc36c56ddada46c) by @boris.trombert ([merge request](kchat/webapp!976))
- [handling fail requests during data prefetch](kchat/webapp@344a64fbabbec25f9bdb1763e5e032bb12f5b94e) by @boris.trombert ([merge request](kchat/webapp!975))
- [change socket error traduction](kchat/webapp@439535234ee8531d1c3a1c7a2fe4e85f2f9290f2) by @boris.trombert ([merge request](kchat/webapp!974))

### Changed (3 changes)

- [Add tooltip to AI actions button](kchat/webapp@ea2e0317664c7af0b9c919f1d7ef357c88e2915c) by @dimitar.slaev ([merge request](kchat/webapp!981))
- [improve javascript error alert](kchat/webapp@6eb75fdcd1581e192e3308275be9a28aac1d6f6b) by @dimitar.slaev ([merge request](kchat/webapp!980))
- [comment gh ci until we improve it to not fail](kchat/webapp@ed36f3b24c2391e4bc7fc63a23d225424fcee628) by @antonbuksa

### Removed (1 change)

- [remove gh ci file](kchat/webapp@3a58562a2c474721b1da77952fab809f55f1b661) by @antonbuksa

## 2.10.0-rc.47 (2024-11-29)

### Fixed (1 change)

- [missing traductions when starting a call on a channel](kchat/webapp@27c438d314b28049000df4cf1c73877c92dcecc3) by @boris.trombert ([merge request](kchat/webapp!972))

## 2.10.0-rc.46 (2024-11-29)

### Fixed (2 changes)

- [set schedule message to 8 am](kchat/webapp@98e261a3d0b32a230d753b2a0034bebcb40713e7) by @boris.trombert ([merge request](kchat/webapp!971))
- [edit post emoji according to cursor position](kchat/webapp@ca75615cdf59c3e4b4495ce5d808ac0a0dcd7ab6) by @boris.trombert ([merge request](kchat/webapp!962))

## 2.10.0-rc.45 (2024-11-29)

### Fixed (1 change)

- [remove glitching border in timepicker for reminder](kchat/webapp@582d0266fb7d5acb9b08979abaed64ed1ef3c144) by @boris.trombert ([merge request](kchat/webapp!969))

## 2.10.0-rc.44 (2024-11-29)

### Fixed (2 changes)

- [fetch missing posts in channel if we found chunk with next_post_id](kchat/webapp@fce43a0d7288e72e7f8eafc8392109c6c5676710) by @boris.trombert ([merge request](kchat/webapp!970))
- [remove glitching border in timepicker for reminder](kchat/webapp@582d0266fb7d5acb9b08979abaed64ed1ef3c144) by @boris.trombert ([merge request](kchat/webapp!969))

## 2.10.0-rc.43 (2024-11-25)

### Fixed (2 changes)

- [fix: handle case where channel is undefined for channel header dropdown](kchat/webapp@6bd80ba42c323d68702ad7248848baf62738d2db) by @boris.trombert ([merge request](kchat/webapp!968))
- [refactor createOption function to preserve original label value for keywords settings](kchat/webapp@6c5838606046c6c94d32005e1050797e30e4d448) by @boris.trombert ([merge request](kchat/webapp!967))

### Changed (1 change)

- [ci: invalidate nginx cache on deploy](kchat/webapp@8d7a9977977236512f8e620be3e003ffc6c1b855) by @leopold.jacquot ([merge request](kchat/webapp!966))

## 2.10.0-rc.42 (2024-11-18)

No changes.

## 2.10.0-rc.41 (2024-11-18)

### Removed (1 change)

- [hide broken help link](kchat/webapp@b5b69c065f5cf71b9b842bb88ea2413e6111262e) by @antonbuksa ([merge request](kchat/webapp!963))

## 2.10.0-rc.40 (2024-11-13)

### Changed (1 change)

- [delay ws channel resubs on reconnect until post prefetch finished](kchat/webapp@4eabf5ba31a899be32ebd65bd4c8467d1d0ef979) by @antonbuksa ([merge request](kchat/webapp!965))

## 2.10.0-rc.39 (2024-11-07)

### Fixed (1 change)

- [add header to channel preview](kchat/webapp@b8713762920add4501d4a55465bdb79aab71d734) by  ([merge request](kchat/webapp!844))

### Changed (1 change)

- [implementation sync between chan preview header & regular chan header](kchat/webapp@ca8c19d35f731f5365a94544461c0a1867155a71) by @antonbuksa ([merge request](kchat/webapp!844))

## 2.10.0-rc.38 (2024-11-05)

No changes.

## 2.10.0-rc.37 (2024-11-01)

### Fixed (1 change)

- [fix: use transform: scale property instead of zoom for browsers compatibility](kchat/webapp@d22fdce308fb36d81ac88e488d5bbe53ef8a6563) by @boris.trombert ([merge request](kchat/webapp!961))

## 2.10.0-rc.36 (2024-10-29)

### Fixed (1 change)

- [fix: hide menu for transcript when empty and add close button](kchat/webapp@2248b60f8d57e8617161e851515813110e84e8d7) by @boris.trombert ([merge request](kchat/webapp!959))

## 2.10.0-rc.35 (2024-10-28)

### Added (1 change)

- [render voice messages as a postType using new transcription field in post meta](kchat/webapp@1a2d1a73cef8e057a4442ddf1648f45d9e984118) by @antonbuksa ([merge request](kchat/webapp!956))

### Fixed (2 changes)

- [redirect to kchat tab directly in ksuite redirect](kchat/webapp@78d809a35671b3f43905bb8529f400cdb8bf76ed) by @antonbuksa ([merge request](kchat/webapp!958))
- [fix double redirect in ksuite iframe](kchat/webapp@b0bd3c99d10b19b9f967d9d0f3b1921be0005206) by @antonbuksa

## 2.10.0-rc.34 (2024-10-24)

### Changed (1 change)

- [do not specify sample rate to audio context if firefox on linux](kchat/webapp@738c5a457b4d6d430ffef50cbca4e1d98ae00e10) by @antonbuksa ([merge request](kchat/webapp!957))

## 2.10.0-rc.33 (2024-10-24)

### Fixed (2 changes)

- [fix: wrap emoji name in status tooltip](kchat/webapp@e21d44925a6b140e89278f94bb3b5823b6258265) by @boris.trombert ([merge request](kchat/webapp!955))
- [prevent resetting lastDisconnectAt if it already exists to avoid user fetch bug on WS reconnect](kchat/webapp@d5a721af7eed29d56f5e473dd49b742464cc1a5c) by @boris.trombert ([merge request](kchat/webapp!890))

## 2.10.0-rc.32 (2024-10-23)

### Changed (1 change)

- [add early return in ksuite redirect](kchat/webapp@27d93a330898e05a9245694a2287a240a80c5a13) by @antonbuksa

## 2.10.0-rc.31 (2024-10-23)

### Fixed (1 change)

- [fix base url split for ksuite redirect](kchat/webapp@7cbc515583dc126d7aec79fd75e6526d1205dd0b) by @antonbuksa

## 2.10.0-rc.30 (2024-10-23)

### Added (1 change)

- [web only redirect to ksuite from base url](kchat/webapp@144f635a2121be1ea701bab0eea86f0b6df490a7) by @antonbuksa ([merge request](kchat/webapp!954))

### Fixed (1 change)

- [fix french traduction for tooltip emoji reaction](kchat/webapp@a33ebf89764bdeb71b7b3a9e577cf85d6fee5c65) by @boris.trombert ([merge request](kchat/webapp!953))

## 2.10.0-rc.29 (2024-10-22)

### Fixed (2 changes)

- [change status emoji size when hover on status](kchat/webapp@d104f450bbd6e245da8e931eba8125d05849b838) by @boris.trombert ([merge request](kchat/webapp!952))
- [show transcript by default for vocal messages](kchat/webapp@68c0a7a3c9b75d15f25aecfcc10c97412aeca42c) by @boris.trombert ([merge request](kchat/webapp!950))

## 2.10.0-rc.28 (2024-10-03)

### Changed (1 change)

- [restore custom pagination in get all groups call](kchat/webapp@6d3a87e27221587656aa264dc5f530905d8b1894) by @antonbuksa ([merge request](kchat/webapp!938))

## 2.10.0-rc.27 (2024-10-03)

### Fixed (2 changes)

- [pass id of draft from props instead of draftFromChannel const](kchat/webapp@f1690a1f05445e039913d455a1e2f82099c86e8a) by @boris.trombert ([merge request](kchat/webapp!936))
- [redirect in general only if unauthorized actions in ws reconnect](kchat/webapp@17c6026729301336771d5aed1ac3d813d1e97157) by @boris.trombert ([merge request](kchat/webapp!935))

## 2.10.0-rc.26 (2024-10-01)

### Fixed (1 change)

- [fix: enable preview for all image types without initial or mini preview](kchat/webapp@5df701df3fc1fd02898a375e5f1cbe3af7c52a2c) by @cyril.gromoff ([merge request](kchat/webapp!911))

## 2.10.0-rc.25 (2024-10-01)

### Fixed (3 changes)

- [correct spelling mistakes](kchat/webapp@956f47b262a9537e3df85636f507bce07aa44293) by @cyril.gromoff ([merge request](kchat/webapp!934))
- [Fix: change dropdown status text when there is not expire date](kchat/webapp@0d7934cb3c158e077f1b229e0fbb6af786835647) by @cyril.gromoff ([merge request](kchat/webapp!928))
- [add function to get the last numbered line from text for numbered list](kchat/webapp@7f1b909cfd975a6db078a10a2a5bc8efea5f13e2) by @boris.trombert ([merge request](kchat/webapp!896))

## 2.10.0-rc.24 (2024-09-30)

### Added (1 change)

- [custom keywords notifications in params for dekstop](kchat/webapp@7d66b45e74264275f797a21d8d02c1de49fcfceb) by @boris.trombert ([merge request](kchat/webapp!930))

## 2.10.0-rc.23 (2024-09-27)

No changes.

## 2.10.0-rc.22 (2024-09-26)

### Fixed (2 changes)

- [last admin and user of a private channel can only archive it](kchat/webapp@597cece29bd5f190d96cd8539b1028afe373f9d7) by @boris.trombert ([merge request](kchat/webapp!933))
- [Make channel optional for toast in post view](kchat/webapp@aa16c6e61c97c5760709f4b4aa0ea80700a33169) by @boris.trombert ([merge request](kchat/webapp!929))

## 2.10.0-rc.21 (2024-09-25)

No changes.

## 2.10.0-rc.20 (2024-09-24)

### Fixed (1 change)

- [Make channel optional for toast in post view](kchat/webapp@aa16c6e61c97c5760709f4b4aa0ea80700a33169) by @boris.trombert ([merge request](kchat/webapp!929))

## 2.10.0-rc.19 (2024-09-20)

No changes.

## 2.10.0-rc.18 (2024-09-19)

No changes.

## 2.10.0-rc.17 (2024-09-19)

### Fixed (1 change)

- [Fix: notifications parameter > add missining translation (fr)](kchat/webapp@2e4fe6d53050c611d4c5deed91bd9aa77731b9af) by @cyril.gromoff ([merge request](kchat/webapp!927))

## 2.10.0-rc.16 (2024-09-19)

No changes.

## 2.10.0-rc.15 (2024-09-17)

### Added (1 change)

- [reimplement reactions tooltip truncate](kchat/webapp@ad901db97331704e3e6c8b6713a39614fb888654) by @antonbuksa ([merge request](kchat/webapp!923))

### Fixed (3 changes)

- [fix submitting bool instead of string for useAutomaticTimezone](kchat/webapp@a8e65420e87bce2f2af69342046204d066b3d0bd) by @antonbuksa
- [fix wrong state for automaticTimezone](kchat/webapp@76c53934601c484cb5c61329d02bde80ed3bdabb) by @antonbuksa
- [update isRecording wording](kchat/webapp@97c00d83b2ccf7302c2d0f73a055bf9ba143e956) by @cyril.gromoff ([merge request](kchat/webapp!920))

## 2.10.0-rc.14 (2024-09-17)

### Fixed (2 changes)

- [fix submitting bool instead of string for useAutomaticTimezone](kchat/webapp@a8e65420e87bce2f2af69342046204d066b3d0bd) by @antonbuksa
- [fix wrong state for automaticTimezone](kchat/webapp@76c53934601c484cb5c61329d02bde80ed3bdabb) by @antonbuksa

## 2.10.0-rc.13 (2024-09-16)

No changes.

## 2.10.0-rc.12 (2024-09-16)

### Fixed (2 changes)

- [schedule tooltip close behaviour works now properly](kchat/webapp@c8dfd362c7557f836eb34c6722c18567d85a5388) by @cyril.gromoff ([merge request](kchat/webapp!921))
- [add timezone parameter](kchat/webapp@3780200a1b705cdd608549f551cc830f30a062d8) by  ([merge request](kchat/webapp!851))

## 2.10.0-rc.11 (2024-09-13)

No changes.

## 2.10.0-rc.10 (2024-09-13)

No changes.

## 2.10.0-rc.9 (2024-09-12)

### Added (1 change)

- [add feature flag for polls button](kchat/webapp@9f54be11929809430a70196acef959051f7da38e) by @antonbuksa ([merge request](kchat/webapp!914))

### Fixed (2 changes)

- [remove shared icon at mention suggestion](kchat/webapp@7e9af598fd3fd16894dcbcbd78ff80f949be38dd) by @cyril.gromoff ([merge request](kchat/webapp!918))
- [fix: clicking outside works now on polls modal](kchat/webapp@f02c6640c546275628cddb69d577821220c4f291) by @cyril.gromoff ([merge request](kchat/webapp!916))

## 2.10.0-rc.8 (2024-09-10)

### Removed (1 change)

- [remove profile button](kchat/webapp@956e7dd34e990ebb10af8733a56d78554824ef79) by @antonbuksa ([merge request](kchat/webapp!915))

## 2.10.0-rc.7 (2024-09-10)

No changes.

## 2.10.0-rc.6 (2024-09-10)

### Fixed (2 changes)

- [fix dark mode modal sentence black on black](kchat/webapp@33092e5cf049754e2bf7327a2e72ab59402709df) by @cyril.gromoff ([merge request](kchat/webapp!913))
- [new SVG in channel search, light and dark theme](kchat/webapp@27fa510c14c41a3f2dcd1c7806210398f8a63f7d) by @cyril.gromoff ([merge request](kchat/webapp!910))

### Removed (1 change)

- [disable polls for now](kchat/webapp@1c6a39bc538f242901070d6acec784a190c94c70) by @antonbuksa

## 2.10.0-rc.5 (2024-09-09)

No changes.

## 2.10.0-rc.4 (2024-09-09)

### Fixed (2 changes)

- [Fix: Condition in loadConfig](kchat/webapp@5763edbc980b1a8c331abf5ad5f343df8c656068) by  ([merge request](kchat/webapp!837))
- [Fix: Force migration for mac desktop users](kchat/webapp@92b0bc8ec97cf9f25931476ce11ea26ea7228d2e) by  ([merge request](kchat/webapp!837))

### Changed (1 change)

- [do not show forced migration page based on version](kchat/webapp@f09a3832c5559b088019732a8fb8a8ab02ebf4d5) by @antonbuksa ([merge request](kchat/webapp!837))

## 2.10.0-rc.3 (2024-09-04)

No changes.

## 2.10.0-rc.2 (2024-09-04)

No changes.

## 2.9.24 (2025-02-26)

### Added (1 change)

- [feat: welcome kchat bot](kchat/webapp@f0fc2da40e13cea68f34a811fe8c2730620ee103) by @dimitar.slaev ([merge request](kchat/webapp!1012))

### Fixed (8 changes)

- [fix: set thread traduction if find in switch channel provider](kchat/webapp@6f50f0555d30fef07a5aee2c2ad048670ba6b9cd) by @boris.trombert ([merge request](kchat/webapp!1026))
- [fix: add missing draft id if empty](kchat/webapp@cd4db7f1412ba99c68ae92b4862d2328ad7105ef) by @boris.trombert ([merge request](kchat/webapp!1023))
- [fix: add closing backtick for all message chuck to avoid display flash](kchat/webapp@5e5bbeed9e25e62e186cfaa10625d6018de0f28c) by @boris.trombert ([merge request](kchat/webapp!1021))
- [Fixed: Number list being truncated](kchat/webapp@cfec461a85b47f5611d648818e7c302f76c499f9) by @andy.lerandy ([merge request](kchat/webapp!1018))
- [fix: set max height with vh instead of element.clientHeight](kchat/webapp@2edb2d39a1bfe46a47f906d12fbcb479c8c43523) by @boris.trombert ([merge request](kchat/webapp!1017))
- [Fixed sentry errors for notification actions](kchat/webapp@b570b91835843982337b2dacfe26442cfff32832) by @dimitar.slaev ([merge request](kchat/webapp!1015))
- [Fixed: No update on member list for mentions.](kchat/webapp@231793cd3398c40d08d023f3e8e34ceb564cf92b) by @andy.lerandy ([merge request](kchat/webapp!1000))
- [ransform option values into strings, disallowing numeric entries in polls](kchat/webapp@c4c03a0caa16fe529f1f296919d552a4a13f0fc6) by @cyril.gromoff ([merge request](kchat/webapp!946))

### Changed (2 changes)

- [adapt changelog script to not use commits](kchat/webapp@1febe9fc58c1df8a8b39bcabd741df65209fb89b) by @antonbuksa ([merge request](kchat/webapp!1022))
- [Updated: Date formating for web/desk - Harmonised behavior.](kchat/webapp@e7fd92f6b2fb3f941f01582cbc0d1d89e2deebfe) by @andy.lerandy ([merge request](kchat/webapp!1007))

### Removed (1 change)

- [removed unnecessary websocket logs](kchat/webapp@727d9ae10091dc15b22675c5763d2b52ecd2bdd8) by @dimitar.slaev ([merge request](kchat/webapp!1016))

## 2.9.23 (2025-02-18)

### Fixed (16 changes)

- [Fixed: Emojis zoom out on hover.](kchat/webapp@b2b08d853ee0120bde1db3812a16efc0647035cf) by @andy.lerandy ([merge request](kchat/webapp!1014))
- [Updated: Reduced number of calls on startup.](kchat/webapp@d7f2221482224033196afa8693710dfb8f1abe83) by @andy.lerandy ([merge request](kchat/webapp!1010))
- [revert all changes except binding channels synchronously](kchat/webapp@0859c4eee982d9c65dc91c3347404fc63907a8c6) by @dimitar.slaev ([merge request](kchat/webapp!1006))
- [delete team from desktop list when 404](kchat/webapp@0479cbdb42585e30b3b68dd725dc0a3689afb957) by @boris.trombert ([merge request](kchat/webapp!999))
- [update desktop cache when reconnecting ws](kchat/webapp@ea324e3751f664e69f85ac98ad7a9b1e09012fb5) by @boris.trombert ([merge request](kchat/webapp!999))
- [Fix receiving double notifications](kchat/webapp@e07cc70c8b9679d81674fccfcd6f1ce5081137a6) by @dimitar.slaev ([merge request](kchat/webapp!994))
- [Fixed: Inline Text set as table.](kchat/webapp@6df2a19067e3ad5d2c77107d82884c67e5d76659) by @andy.lerandy ([merge request](kchat/webapp!998))
- [Fixed: Viewport of kdrive svg for file preview.](kchat/webapp@f76294b09a318b185f9af12ffc31c448950a1887) by @andy.lerandy ([merge request](kchat/webapp!997))
- [Fixed: Missing translation.](kchat/webapp@e018ca5b90f4a3f905f6aaa096a16f7356388424) by @andy.lerandy ([merge request](kchat/webapp!995))
- [redirect to default team when 404 on reconnect and loadMe](kchat/webapp@d1bca23b33e79d6df79d18514b1456c99260fd06) by @dev_bot ([merge request](kchat/webapp!990))
- [Removed: Duplicated important button.](kchat/webapp@a1cb1a202ec81e5232bbe9042d4915137f1ac8a1) by @andy.lerandy ([merge request](kchat/webapp!993))
- [redirect to default team when 404 on reconnect and loadMe](kchat/webapp@92c518094689cc4a908ba36bcb0bdf696101c502) by @dev_bot ([merge request](kchat/webapp!990))
- [Fixed: Untranslated button & broken ellipsis.](kchat/webapp@0d06efe8ff2f999589fc0aaaaab19390bc13f671) by @andy.lerandy ([merge request](kchat/webapp!992))
- [remove old calendar emoji to avoid duplication](kchat/webapp@25e0771950978aabdf6c5f76e9fd288627ccbd00) by @cyril.gromoff ([merge request](kchat/webapp!939))
- [sound notifications works properly when there are attachement with texts messages](kchat/webapp@1a1fac4599ee74b8c27f81b85141384a1cdb8294) by @cyril.gromoff ([merge request](kchat/webapp!949))
- [Ensure post actions close when focus is lost](kchat/webapp@2d03851c5b25679e553f79298da1687e4fb3380e) by @dimitar.slaev ([merge request](kchat/webapp!982))

### Changed (2 changes)

- [Fix missing messages on reconnect](kchat/webapp@2a0764380fb0216318e26f2556bc99eb727ae649) by @dimitar.slaev ([merge request](kchat/webapp!1009))
- [improve logs to debug syncro bugs](kchat/webapp@cdee4f5636ac84e19327cbe50bb3907b7e3a8611) by @dimitar.slaev ([merge request](kchat/webapp!1005))

### change (1 change)

- [revert: redirect team when 404](kchat/webapp@45c9412876667a9e0a4ead963af392787f317baf) by @dimitar.slaev ([merge request](kchat/webapp!1004))

## 2.9.23-next.4 (2025-02-18)

### Fixed (1 change)

- [Fixed: Emojis zoom out on hover.](kchat/webapp@b2b08d853ee0120bde1db3812a16efc0647035cf) by @andy.lerandy ([merge request](kchat/webapp!1014))

## 2.9.23-next.3 (2025-02-18)

No changes.

## 2.9.23-next.2 (2025-02-17)

### Fixed (10 changes)

- [Updated: Reduced number of calls on startup.](kchat/webapp@d7f2221482224033196afa8693710dfb8f1abe83) by @andy.lerandy ([merge request](kchat/webapp!1010))
- [revert all changes except binding channels synchronously](kchat/webapp@0859c4eee982d9c65dc91c3347404fc63907a8c6) by @dimitar.slaev ([merge request](kchat/webapp!1006))
- [delete team from desktop list when 404](kchat/webapp@0479cbdb42585e30b3b68dd725dc0a3689afb957) by @boris.trombert ([merge request](kchat/webapp!999))
- [update desktop cache when reconnecting ws](kchat/webapp@ea324e3751f664e69f85ac98ad7a9b1e09012fb5) by @boris.trombert ([merge request](kchat/webapp!999))
- [Fix receiving double notifications](kchat/webapp@e07cc70c8b9679d81674fccfcd6f1ce5081137a6) by @dimitar.slaev ([merge request](kchat/webapp!994))
- [Fixed: Inline Text set as table.](kchat/webapp@6df2a19067e3ad5d2c77107d82884c67e5d76659) by @andy.lerandy ([merge request](kchat/webapp!998))
- [Fixed: Viewport of kdrive svg for file preview.](kchat/webapp@f76294b09a318b185f9af12ffc31c448950a1887) by @andy.lerandy ([merge request](kchat/webapp!997))
- [redirect to default team when 404 on reconnect and loadMe](kchat/webapp@d1bca23b33e79d6df79d18514b1456c99260fd06) by @dev_bot ([merge request](kchat/webapp!990))
- [redirect to default team when 404 on reconnect and loadMe](kchat/webapp@92c518094689cc4a908ba36bcb0bdf696101c502) by @dev_bot ([merge request](kchat/webapp!990))
- [remove old calendar emoji to avoid duplication](kchat/webapp@25e0771950978aabdf6c5f76e9fd288627ccbd00) by @cyril.gromoff ([merge request](kchat/webapp!939))

### Changed (2 changes)

- [Fix missing messages on reconnect](kchat/webapp@2a0764380fb0216318e26f2556bc99eb727ae649) by @dimitar.slaev ([merge request](kchat/webapp!1009))
- [improve logs to debug syncro bugs](kchat/webapp@cdee4f5636ac84e19327cbe50bb3907b7e3a8611) by @dimitar.slaev ([merge request](kchat/webapp!1005))

### change (1 change)

- [revert: redirect team when 404](kchat/webapp@45c9412876667a9e0a4ead963af392787f317baf) by @dimitar.slaev ([merge request](kchat/webapp!1004))

## 2.9.23-next.1 (2025-01-23)

### Fixed (5 changes)

- [Fixed: Missing translation.](kchat/webapp@e018ca5b90f4a3f905f6aaa096a16f7356388424) by @andy.lerandy ([merge request](kchat/webapp!995))
- [Removed: Duplicated important button.](kchat/webapp@a1cb1a202ec81e5232bbe9042d4915137f1ac8a1) by @andy.lerandy ([merge request](kchat/webapp!993))
- [Fixed: Untranslated button & broken ellipsis.](kchat/webapp@0d06efe8ff2f999589fc0aaaaab19390bc13f671) by @andy.lerandy ([merge request](kchat/webapp!992))
- [sound notifications works properly when there are attachement with texts messages](kchat/webapp@1a1fac4599ee74b8c27f81b85141384a1cdb8294) by @cyril.gromoff ([merge request](kchat/webapp!949))
- [Ensure post actions close when focus is lost](kchat/webapp@2d03851c5b25679e553f79298da1687e4fb3380e) by @dimitar.slaev ([merge request](kchat/webapp!982))

## 2.9.22 (2025-01-22)

### Fixed (20 changes)

- [fix kdrive import button click handler](kchat/webapp@33b03b07172ecd8913ee431ac37da5149e34c1c9) by @antonbuksa ([merge request](kchat/webapp!991))
- [Fixed: Duplicated keys in component array.](kchat/webapp@da2f277eaddc551b71192739de62c44c2c839167) by @andy.lerandy ([merge request](kchat/webapp!937))
- [remove multiple instances of the same date separator in saved messages](kchat/webapp@5976ae806db349fb0032d6989bb910660cb85d8f) by @cyril.gromoff ([merge request](kchat/webapp!937))
- [Fixed: Duplicated keys in component array.](kchat/webapp@54a23db0b2fc84756f7c0268db5e4d3aeb22af16) by @andy.lerandy ([merge request](kchat/webapp!989))
- [sound notifications works properly when there are attachement with texts messages](kchat/webapp@1a1fac4599ee74b8c27f81b85141384a1cdb8294) by @cyril.gromoff ([merge request](kchat/webapp!949))
- [Fixed: Incorrect z-index for `new_replies_banner`.](kchat/webapp@0738d1ba82b4b696725821165a6e062ce32ece96) by @andy.lerandy ([merge request](kchat/webapp!988))
- [Fixed: Missing translation keys.](kchat/webapp@0dba7b72c821304aecae3d8c80446c61d2f42925) by @andy.lerandy ([merge request](kchat/webapp!987))
- [Hide text input if sending a voice message](kchat/webapp@6645f9e676037ef963c2d2b0ccc620579bf1c69d) by @dimitar.slaev ([merge request](kchat/webapp!983))
- [Ensure post actions close when focus is lost](kchat/webapp@2d03851c5b25679e553f79298da1687e4fb3380e) by @dimitar.slaev ([merge request](kchat/webapp!982))
- [disable schedule message for audio type messages](kchat/webapp@342eba6b9bbcade0c2f426bbbe4dc5fc24b8164d) by @boris.trombert ([merge request](kchat/webapp!978))
- [change reminder to 8am instead of 9am](kchat/webapp@dad23dd8edcbf51e0de859411fc36c56ddada46c) by @boris.trombert ([merge request](kchat/webapp!976))
- [handling fail requests during data prefetch](kchat/webapp@344a64fbabbec25f9bdb1763e5e032bb12f5b94e) by @boris.trombert ([merge request](kchat/webapp!975))
- [change socket error traduction](kchat/webapp@439535234ee8531d1c3a1c7a2fe4e85f2f9290f2) by @boris.trombert ([merge request](kchat/webapp!974))
- [missing traductions when starting a call on a channel](kchat/webapp@27c438d314b28049000df4cf1c73877c92dcecc3) by @boris.trombert ([merge request](kchat/webapp!972))
- [set schedule message to 8 am](kchat/webapp@98e261a3d0b32a230d753b2a0034bebcb40713e7) by @boris.trombert ([merge request](kchat/webapp!971))
- [fetch missing posts in channel if we found chunk with next_post_id](kchat/webapp@fce43a0d7288e72e7f8eafc8392109c6c5676710) by @boris.trombert ([merge request](kchat/webapp!970))
- [remove glitching border in timepicker for reminder](kchat/webapp@582d0266fb7d5acb9b08979abaed64ed1ef3c144) by @boris.trombert ([merge request](kchat/webapp!969))
- [fix: handle case where channel is undefined for channel header dropdown](kchat/webapp@6bd80ba42c323d68702ad7248848baf62738d2db) by @boris.trombert ([merge request](kchat/webapp!968))
- [refactor createOption function to preserve original label value for keywords settings](kchat/webapp@6c5838606046c6c94d32005e1050797e30e4d448) by @boris.trombert ([merge request](kchat/webapp!967))
- [edit post emoji according to cursor position](kchat/webapp@ca75615cdf59c3e4b4495ce5d808ac0a0dcd7ab6) by @boris.trombert ([merge request](kchat/webapp!962))

### Changed (4 changes)

- [Add tooltip to AI actions button](kchat/webapp@ea2e0317664c7af0b9c919f1d7ef357c88e2915c) by @dimitar.slaev ([merge request](kchat/webapp!981))
- [improve javascript error alert](kchat/webapp@6eb75fdcd1581e192e3308275be9a28aac1d6f6b) by @dimitar.slaev ([merge request](kchat/webapp!980))
- [comment gh ci until we improve it to not fail](kchat/webapp@ed36f3b24c2391e4bc7fc63a23d225424fcee628) by @antonbuksa
- [upload menu refactor](kchat/webapp@e43981a7c2435d10a38e402d8676bb498a1b5942) by @antonbuksa ([merge request](kchat/webapp!984))

### Removed (1 change)

- [remove gh ci file](kchat/webapp@3a58562a2c474721b1da77952fab809f55f1b661) by @antonbuksa

### Chore (2 changes)

- [clean eslint errors in announcement bar](kchat/webapp@8d984ab4cd40243f94347258d1634dad747220f0) by @antonbuksa
- [build(deps): bump ksuite bridge version to 0.3.6](kchat/webapp@39d70ac02fe0724db2ff625e90115f5e1c25ed54) by @charbel.naoum ([merge request](kchat/webapp!986))

### change (1 change)

- [FIx post input width in center mode](kchat/webapp@46bf456fa0f37d23b97e4629bae60fecae750459) by @dimitar.slaev ([merge request](kchat/webapp!985))

## 2.9.22-next.6 (2025-01-22)

### Fixed (5 changes)

- [fix kdrive import button click handler](kchat/webapp@33b03b07172ecd8913ee431ac37da5149e34c1c9) by @antonbuksa ([merge request](kchat/webapp!991))
- [Fixed: Duplicated keys in component array.](kchat/webapp@da2f277eaddc551b71192739de62c44c2c839167) by @andy.lerandy ([merge request](kchat/webapp!937))
- [remove multiple instances of the same date separator in saved messages](kchat/webapp@5976ae806db349fb0032d6989bb910660cb85d8f) by @cyril.gromoff ([merge request](kchat/webapp!937))
- [sound notifications works properly when there are attachement with texts messages](kchat/webapp@1a1fac4599ee74b8c27f81b85141384a1cdb8294) by @cyril.gromoff ([merge request](kchat/webapp!949))
- [Ensure post actions close when focus is lost](kchat/webapp@2d03851c5b25679e553f79298da1687e4fb3380e) by @dimitar.slaev ([merge request](kchat/webapp!982))

## 2.9.22-next.5 (2025-01-21)

### Fixed (3 changes)

- [Fixed: Duplicated keys in component array.](kchat/webapp@54a23db0b2fc84756f7c0268db5e4d3aeb22af16) by @andy.lerandy ([merge request](kchat/webapp!989))
- [Fixed: Incorrect z-index for `new_replies_banner`.](kchat/webapp@0738d1ba82b4b696725821165a6e062ce32ece96) by @andy.lerandy ([merge request](kchat/webapp!988))
- [Fixed: Missing translation keys.](kchat/webapp@0dba7b72c821304aecae3d8c80446c61d2f42925) by @andy.lerandy ([merge request](kchat/webapp!987))

## 2.9.22-next.4 (2025-01-14)

### Fixed (1 change)

- [Hide text input if sending a voice message](kchat/webapp@6645f9e676037ef963c2d2b0ccc620579bf1c69d) by @dimitar.slaev ([merge request](kchat/webapp!983))

### Changed (1 change)

- [upload menu refactor](kchat/webapp@e43981a7c2435d10a38e402d8676bb498a1b5942) by @antonbuksa ([merge request](kchat/webapp!984))

### Chore (2 changes)

- [clean eslint errors in announcement bar](kchat/webapp@8d984ab4cd40243f94347258d1634dad747220f0) by @antonbuksa
- [build(deps): bump ksuite bridge version to 0.3.6](kchat/webapp@39d70ac02fe0724db2ff625e90115f5e1c25ed54) by @charbel.naoum ([merge request](kchat/webapp!986))

### change (1 change)

- [FIx post input width in center mode](kchat/webapp@46bf456fa0f37d23b97e4629bae60fecae750459) by @dimitar.slaev ([merge request](kchat/webapp!985))

## 2.9.22-next.3 (2025-01-08)

### Fixed (4 changes)

- [disable schedule message for audio type messages](kchat/webapp@342eba6b9bbcade0c2f426bbbe4dc5fc24b8164d) by @boris.trombert ([merge request](kchat/webapp!978))
- [change reminder to 8am instead of 9am](kchat/webapp@dad23dd8edcbf51e0de859411fc36c56ddada46c) by @boris.trombert ([merge request](kchat/webapp!976))
- [handling fail requests during data prefetch](kchat/webapp@344a64fbabbec25f9bdb1763e5e032bb12f5b94e) by @boris.trombert ([merge request](kchat/webapp!975))
- [change socket error traduction](kchat/webapp@439535234ee8531d1c3a1c7a2fe4e85f2f9290f2) by @boris.trombert ([merge request](kchat/webapp!974))

### Changed (3 changes)

- [Add tooltip to AI actions button](kchat/webapp@ea2e0317664c7af0b9c919f1d7ef357c88e2915c) by @dimitar.slaev ([merge request](kchat/webapp!981))
- [improve javascript error alert](kchat/webapp@6eb75fdcd1581e192e3308275be9a28aac1d6f6b) by @dimitar.slaev ([merge request](kchat/webapp!980))
- [comment gh ci until we improve it to not fail](kchat/webapp@ed36f3b24c2391e4bc7fc63a23d225424fcee628) by @antonbuksa

### Removed (1 change)

- [remove gh ci file](kchat/webapp@3a58562a2c474721b1da77952fab809f55f1b661) by @antonbuksa

## 2.9.22-next.2 (2024-11-29)

### Fixed (5 changes)

- [missing traductions when starting a call on a channel](kchat/webapp@27c438d314b28049000df4cf1c73877c92dcecc3) by @boris.trombert ([merge request](kchat/webapp!972))
- [set schedule message to 8 am](kchat/webapp@98e261a3d0b32a230d753b2a0034bebcb40713e7) by @boris.trombert ([merge request](kchat/webapp!971))
- [fetch missing posts in channel if we found chunk with next_post_id](kchat/webapp@fce43a0d7288e72e7f8eafc8392109c6c5676710) by @boris.trombert ([merge request](kchat/webapp!970))
- [remove glitching border in timepicker for reminder](kchat/webapp@582d0266fb7d5acb9b08979abaed64ed1ef3c144) by @boris.trombert ([merge request](kchat/webapp!969))
- [edit post emoji according to cursor position](kchat/webapp@ca75615cdf59c3e4b4495ce5d808ac0a0dcd7ab6) by @boris.trombert ([merge request](kchat/webapp!962))

## 2.9.22-next.1 (2024-11-25)

### Fixed (2 changes)

- [fix: handle case where channel is undefined for channel header dropdown](kchat/webapp@6bd80ba42c323d68702ad7248848baf62738d2db) by @boris.trombert ([merge request](kchat/webapp!968))
- [refactor createOption function to preserve original label value for keywords settings](kchat/webapp@6c5838606046c6c94d32005e1050797e30e4d448) by @boris.trombert ([merge request](kchat/webapp!967))

## 2.9.21-next.2 (2024-11-19)

### Changed (2 changes)

- [ci: invalidate nginx cache on deploy](kchat/webapp@8d7a9977977236512f8e620be3e003ffc6c1b855) by @leopold.jacquot ([merge request](kchat/webapp!966))
- [delay ws channel resubs on reconnect until post prefetch finished](kchat/webapp@4eabf5ba31a899be32ebd65bd4c8467d1d0ef979) by @antonbuksa ([merge request](kchat/webapp!965))

### Removed (1 change)

- [hide broken help link](kchat/webapp@b5b69c065f5cf71b9b842bb88ea2413e6111262e) by @antonbuksa ([merge request](kchat/webapp!963))

## 2.9.21-next.1 (2024-11-07)

### Fixed (1 change)

- [add header to channel preview](kchat/webapp@b8713762920add4501d4a55465bdb79aab71d734) by  ([merge request](kchat/webapp!844))

### Changed (1 change)

- [implementation sync between chan preview header & regular chan header](kchat/webapp@ca8c19d35f731f5365a94544461c0a1867155a71) by @antonbuksa ([merge request](kchat/webapp!844))

### Chore (1 change)

- [move ksuite bridge to redux package for tests](kchat/webapp@f1898f084886a50c299b99ad30fc66343f90ab82) by @antonbuksa ([merge request](kchat/webapp!960))

## 2.9.20-next.5 (2024-11-01)

### Fixed (1 change)

- [fix: use transform: scale property instead of zoom for browsers compatibility](kchat/webapp@d22fdce308fb36d81ac88e488d5bbe53ef8a6563) by @boris.trombert ([merge request](kchat/webapp!961))

## 2.9.20-next.4 (2024-10-29)

### Added (1 change)

- [render voice messages as a postType using new transcription field in post meta](kchat/webapp@1a2d1a73cef8e057a4442ddf1648f45d9e984118) by @antonbuksa ([merge request](kchat/webapp!956))

### Fixed (2 changes)

- [fix: hide menu for transcript when empty and add close button](kchat/webapp@2248b60f8d57e8617161e851515813110e84e8d7) by @boris.trombert ([merge request](kchat/webapp!959))
- [redirect to kchat tab directly in ksuite redirect](kchat/webapp@78d809a35671b3f43905bb8529f400cdb8bf76ed) by @antonbuksa ([merge request](kchat/webapp!958))

## 2.9.20-next.3 (2024-10-24)

### Fixed (1 change)

- [fix double redirect in ksuite iframe](kchat/webapp@b0bd3c99d10b19b9f967d9d0f3b1921be0005206) by @antonbuksa

### Changed (1 change)

- [do not specify sample rate to audio context if firefox on linux](kchat/webapp@738c5a457b4d6d430ffef50cbca4e1d98ae00e10) by @antonbuksa ([merge request](kchat/webapp!957))

## 2.9.20-next.2 (2024-10-24)

### Added (1 change)

- [web only redirect to ksuite from base url](kchat/webapp@144f635a2121be1ea701bab0eea86f0b6df490a7) by @antonbuksa ([merge request](kchat/webapp!954))

### Fixed (4 changes)

- [fix: wrap emoji name in status tooltip](kchat/webapp@e21d44925a6b140e89278f94bb3b5823b6258265) by @boris.trombert ([merge request](kchat/webapp!955))
- [fix base url split for ksuite redirect](kchat/webapp@7cbc515583dc126d7aec79fd75e6526d1205dd0b) by @antonbuksa
- [fix french traduction for tooltip emoji reaction](kchat/webapp@a33ebf89764bdeb71b7b3a9e577cf85d6fee5c65) by @boris.trombert ([merge request](kchat/webapp!953))
- [prevent resetting lastDisconnectAt if it already exists to avoid user fetch bug on WS reconnect](kchat/webapp@d5a721af7eed29d56f5e473dd49b742464cc1a5c) by @boris.trombert ([merge request](kchat/webapp!890))

### Changed (2 changes)

- [do not specify sample rate to audio context if firefox on linux](kchat/webapp@738c5a457b4d6d430ffef50cbca4e1d98ae00e10) by @antonbuksa ([merge request](kchat/webapp!957))
- [add early return in ksuite redirect](kchat/webapp@27d93a330898e05a9245694a2287a240a80c5a13) by @antonbuksa

## 2.9.20-next.1 (2024-10-22)

### Fixed (2 changes)

- [change status emoji size when hover on status](kchat/webapp@d104f450bbd6e245da8e931eba8125d05849b838) by @boris.trombert ([merge request](kchat/webapp!952))
- [show transcript by default for vocal messages](kchat/webapp@68c0a7a3c9b75d15f25aecfcc10c97412aeca42c) by @boris.trombert ([merge request](kchat/webapp!950))

## 2.9.19 (2024-10-07)

### Added (1 change)

- [custom keywords notifications in params for dekstop](kchat/webapp@7d66b45e74264275f797a21d8d02c1de49fcfceb) by @boris.trombert ([merge request](kchat/webapp!930))

### Fixed (7 changes)

- [pass id of draft from props instead of draftFromChannel const](kchat/webapp@f1690a1f05445e039913d455a1e2f82099c86e8a) by @boris.trombert ([merge request](kchat/webapp!936))
- [redirect in general only if unauthorized actions in ws reconnect](kchat/webapp@17c6026729301336771d5aed1ac3d813d1e97157) by @boris.trombert ([merge request](kchat/webapp!935))
- [fix: enable preview for all image types without initial or mini preview](kchat/webapp@5df701df3fc1fd02898a375e5f1cbe3af7c52a2c) by @cyril.gromoff ([merge request](kchat/webapp!911))
- [correct spelling mistakes](kchat/webapp@956f47b262a9537e3df85636f507bce07aa44293) by @cyril.gromoff ([merge request](kchat/webapp!934))
- [last admin and user of a private channel can only archive it](kchat/webapp@597cece29bd5f190d96cd8539b1028afe373f9d7) by @boris.trombert ([merge request](kchat/webapp!933))
- [Fix: change dropdown status text when there is not expire date](kchat/webapp@0d7934cb3c158e077f1b229e0fbb6af786835647) by @cyril.gromoff ([merge request](kchat/webapp!928))
- [add function to get the last numbered line from text for numbered list](kchat/webapp@7f1b909cfd975a6db078a10a2a5bc8efea5f13e2) by @boris.trombert ([merge request](kchat/webapp!896))

### Changed (1 change)

- [restore custom pagination in get all groups call](kchat/webapp@6d3a87e27221587656aa264dc5f530905d8b1894) by @antonbuksa ([merge request](kchat/webapp!938))

## 2.9.18-next.3 (2024-10-03)

### Added (1 change)

- [custom keywords notifications in params for dekstop](kchat/webapp@7d66b45e74264275f797a21d8d02c1de49fcfceb) by @boris.trombert ([merge request](kchat/webapp!930))

### Fixed (7 changes)

- [pass id of draft from props instead of draftFromChannel const](kchat/webapp@f1690a1f05445e039913d455a1e2f82099c86e8a) by @boris.trombert ([merge request](kchat/webapp!936))
- [redirect in general only if unauthorized actions in ws reconnect](kchat/webapp@17c6026729301336771d5aed1ac3d813d1e97157) by @boris.trombert ([merge request](kchat/webapp!935))
- [fix: enable preview for all image types without initial or mini preview](kchat/webapp@5df701df3fc1fd02898a375e5f1cbe3af7c52a2c) by @cyril.gromoff ([merge request](kchat/webapp!911))
- [correct spelling mistakes](kchat/webapp@956f47b262a9537e3df85636f507bce07aa44293) by @cyril.gromoff ([merge request](kchat/webapp!934))
- [last admin and user of a private channel can only archive it](kchat/webapp@597cece29bd5f190d96cd8539b1028afe373f9d7) by @boris.trombert ([merge request](kchat/webapp!933))
- [Fix: change dropdown status text when there is not expire date](kchat/webapp@0d7934cb3c158e077f1b229e0fbb6af786835647) by @cyril.gromoff ([merge request](kchat/webapp!928))
- [add function to get the last numbered line from text for numbered list](kchat/webapp@7f1b909cfd975a6db078a10a2a5bc8efea5f13e2) by @boris.trombert ([merge request](kchat/webapp!896))

### Changed (1 change)

- [restore custom pagination in get all groups call](kchat/webapp@6d3a87e27221587656aa264dc5f530905d8b1894) by @antonbuksa ([merge request](kchat/webapp!938))

## 2.9.18-next.2 (2024-09-23)

### Fixed (2 changes)

- [Make channel optional for toast in post view](kchat/webapp@aa16c6e61c97c5760709f4b4aa0ea80700a33169) by @boris.trombert ([merge request](kchat/webapp!929))
- [Fix: notifications parameter > add missining translation (fr)](kchat/webapp@2e4fe6d53050c611d4c5deed91bd9aa77731b9af) by @cyril.gromoff ([merge request](kchat/webapp!927))

## 2.9.18-next.1 (2024-09-17)

### Added (1 change)

- [reimplement reactions tooltip truncate](kchat/webapp@ad901db97331704e3e6c8b6713a39614fb888654) by @antonbuksa ([merge request](kchat/webapp!923))

### Fixed (1 change)

- [update isRecording wording](kchat/webapp@97c00d83b2ccf7302c2d0f73a055bf9ba143e956) by @cyril.gromoff ([merge request](kchat/webapp!920))

## 2.9.17-next.4 (2024-09-16)

### Fixed (1 change)

- [fix submitting bool instead of string for useAutomaticTimezone](kchat/webapp@a8e65420e87bce2f2af69342046204d066b3d0bd) by @antonbuksa

## 2.9.17-next.3 (2024-09-16)

### Fixed (1 change)

- [fix wrong state for automaticTimezone](kchat/webapp@76c53934601c484cb5c61329d02bde80ed3bdabb) by @antonbuksa

## 2.9.17-next.2 (2024-09-16)

### Fixed (2 changes)

- [schedule tooltip close behaviour works now properly](kchat/webapp@c8dfd362c7557f836eb34c6722c18567d85a5388) by @cyril.gromoff ([merge request](kchat/webapp!921))
- [add timezone parameter](kchat/webapp@3780200a1b705cdd608549f551cc830f30a062d8) by  ([merge request](kchat/webapp!851))

## 2.9.17-next.1 (2024-09-12)

### Fixed (2 changes)

- [remove shared icon at mention suggestion](kchat/webapp@7e9af598fd3fd16894dcbcbd78ff80f949be38dd) by @cyril.gromoff ([merge request](kchat/webapp!918))
- [fix: clicking outside works now on polls modal](kchat/webapp@f02c6640c546275628cddb69d577821220c4f291) by @cyril.gromoff ([merge request](kchat/webapp!916))

## 2.9.16-next.1 (2024-09-10)

### Added (1 change)

- [add feature flag for polls button](kchat/webapp@9f54be11929809430a70196acef959051f7da38e) by @antonbuksa ([merge request](kchat/webapp!914))

## 2.9.15-next.1 (2024-09-10)

### Fixed (4 changes)

- [fix dark mode modal sentence black on black](kchat/webapp@33092e5cf049754e2bf7327a2e72ab59402709df) by @cyril.gromoff ([merge request](kchat/webapp!913))
- [new SVG in channel search, light and dark theme](kchat/webapp@27fa510c14c41a3f2dcd1c7806210398f8a63f7d) by @cyril.gromoff ([merge request](kchat/webapp!910))
- [Fix: Condition in loadConfig](kchat/webapp@5763edbc980b1a8c331abf5ad5f343df8c656068) by  ([merge request](kchat/webapp!837))
- [Fix: Force migration for mac desktop users](kchat/webapp@92b0bc8ec97cf9f25931476ce11ea26ea7228d2e) by  ([merge request](kchat/webapp!837))

### Changed (1 change)

- [do not show forced migration page based on version](kchat/webapp@f09a3832c5559b088019732a8fb8a8ab02ebf4d5) by @antonbuksa ([merge request](kchat/webapp!837))

### Removed (2 changes)

- [remove profile button](kchat/webapp@956e7dd34e990ebb10af8733a56d78554824ef79) by @antonbuksa ([merge request](kchat/webapp!915))
- [disable polls for now](kchat/webapp@1c6a39bc538f242901070d6acec784a190c94c70) by @antonbuksa

## 2.9.14 (2024-09-09)

### Removed (1 change)

- [disable polls for now](kchat/webapp@1c6a39bc538f242901070d6acec784a190c94c70) by @antonbuksa

## 2.9.13-rc.4 (2024-09-03)

### Fixed (1 change)

- [polls now does'nt appears anymore in all threads](kchat/webapp@faa6118eb446b5afcb9323d21a0bfa93dbf49667) by @cyril.gromoff ([merge request](kchat/webapp!909))

## 2.9.13-rc.3 (2024-09-03)

### Fixed (4 changes)

- [remove polls when we are in a thread](kchat/webapp@0d401e5796f872a725eea1b0c4a1ca06c5b983bf) by @cyril.gromoff ([merge request](kchat/webapp!908))
- [reduce limit modal title font size and add global padding to limit modal content](kchat/webapp@d055897158502c2c88ccfc6552eb4d4cd34c274a) by @cyril.gromoff ([merge request](kchat/webapp!907))
- [change 'résumer un fil de discussion' to 'Résumer' with correct translation](kchat/webapp@5e90cea25c80fad2ab56407c8d02d251c8a9709f) by @cyril.gromoff ([merge request](kchat/webapp!903))
- [add correct translation for the thread action bar](kchat/webapp@8731686f6b7f8139d149389d55879e9e414fdba0) by @cyril.gromoff ([merge request](kchat/webapp!905))

## 2.9.13-rc.2 (2024-08-28)

### Fixed (1 change)

- [updating readme by adding Common errors section and Canvas error solving](kchat/webapp@f2a7d72fe548909b78d87f6fe5c56d66fa943eb5) by @cyril.gromoff ([merge request](kchat/webapp!898))

### Chore (1 change)

- [chore: allow gif as supported profile image](kchat/webapp@c6efb35220bcf1a663f97734ac45a0b6f64d47f8) by @leopold.jacquot ([merge request](kchat/webapp!904))

## 2.9.13-rc.1 (2024-08-28)

### Fixed (4 changes)

- [adding correct translations when we want to transfer a thread](kchat/webapp@dc80af1920be5914a7b3e4206f9bf94ea0faa24c) by @cyril.gromoff ([merge request](kchat/webapp!902))
- [pass current user id for postpone reminder](kchat/webapp@458ccd766b0a5af6b3bad064b125c0df5b95e924) by @boris.trombert ([merge request](kchat/webapp!900))
- [add poll button in the formatting bar that trigger a poll](kchat/webapp@d5b934634e7155db31c5ae634a5d5f73e0497338) by @cyril.gromoff ([merge request](kchat/webapp!451))
- [add the right text when we want to invite a user who is already in the targeted channel](kchat/webapp@362f48692369f73f03d793e16c919a65ab0a0ade) by @cyril.gromoff ([merge request](kchat/webapp!883))

### Chore (1 change)

- [chore: add webp as image types](kchat/webapp@bf1d75e0f41bca06035762ac87a4ee4633078536) by @leopold.jacquot ([merge request](kchat/webapp!901))

## 2.9.13-next.3 (2024-09-09)

### Fixed (2 changes)

- [Fix: Condition in loadConfig](kchat/webapp@5763edbc980b1a8c331abf5ad5f343df8c656068) by  ([merge request](kchat/webapp!837))
- [Fix: Force migration for mac desktop users](kchat/webapp@92b0bc8ec97cf9f25931476ce11ea26ea7228d2e) by  ([merge request](kchat/webapp!837))

### Changed (1 change)

- [do not show forced migration page based on version](kchat/webapp@f09a3832c5559b088019732a8fb8a8ab02ebf4d5) by @antonbuksa ([merge request](kchat/webapp!837))

## 2.9.13-next.2 (2024-09-03)

### Fixed (5 changes)

- [polls now does'nt appears anymore in all threads](kchat/webapp@faa6118eb446b5afcb9323d21a0bfa93dbf49667) by @cyril.gromoff ([merge request](kchat/webapp!909))
- [remove polls when we are in a thread](kchat/webapp@0d401e5796f872a725eea1b0c4a1ca06c5b983bf) by @cyril.gromoff ([merge request](kchat/webapp!908))
- [reduce limit modal title font size and add global padding to limit modal content](kchat/webapp@d055897158502c2c88ccfc6552eb4d4cd34c274a) by @cyril.gromoff ([merge request](kchat/webapp!907))
- [change 'résumer un fil de discussion' to 'Résumer' with correct translation](kchat/webapp@5e90cea25c80fad2ab56407c8d02d251c8a9709f) by @cyril.gromoff ([merge request](kchat/webapp!903))
- [add correct translation for the thread action bar](kchat/webapp@8731686f6b7f8139d149389d55879e9e414fdba0) by @cyril.gromoff ([merge request](kchat/webapp!905))

## 2.9.13-next.1 (2024-08-28)

### Fixed (5 changes)

- [adding correct translations when we want to transfer a thread](kchat/webapp@dc80af1920be5914a7b3e4206f9bf94ea0faa24c) by @cyril.gromoff ([merge request](kchat/webapp!902))
- [pass current user id for postpone reminder](kchat/webapp@458ccd766b0a5af6b3bad064b125c0df5b95e924) by @boris.trombert ([merge request](kchat/webapp!900))
- [updating readme by adding Common errors section and Canvas error solving](kchat/webapp@f2a7d72fe548909b78d87f6fe5c56d66fa943eb5) by @cyril.gromoff ([merge request](kchat/webapp!898))
- [add poll button in the formatting bar that trigger a poll](kchat/webapp@d5b934634e7155db31c5ae634a5d5f73e0497338) by @cyril.gromoff ([merge request](kchat/webapp!451))
- [add the right text when we want to invite a user who is already in the targeted channel](kchat/webapp@362f48692369f73f03d793e16c919a65ab0a0ade) by @cyril.gromoff ([merge request](kchat/webapp!883))

### Chore (2 changes)

- [chore: allow gif as supported profile image](kchat/webapp@c6efb35220bcf1a663f97734ac45a0b6f64d47f8) by @leopold.jacquot ([merge request](kchat/webapp!904))
- [chore: add webp as image types](kchat/webapp@bf1d75e0f41bca06035762ac87a4ee4633078536) by @leopold.jacquot ([merge request](kchat/webapp!901))

## 2.9.12-rc.2 (2024-08-27)

### Fixed (1 change)

- [pass current user id for postpone reminder](kchat/webapp@458ccd766b0a5af6b3bad064b125c0df5b95e924) by @boris.trombert ([merge request](kchat/webapp!900))

## 2.9.12-rc.1 (2024-08-26)

### Fixed (2 changes)

- [add poll button in the formatting bar that trigger a poll](kchat/webapp@d5b934634e7155db31c5ae634a5d5f73e0497338) by @cyril.gromoff ([merge request](kchat/webapp!451))
- [add the right text when we want to invite a user who is already in the targeted channel](kchat/webapp@362f48692369f73f03d793e16c919a65ab0a0ade) by @cyril.gromoff ([merge request](kchat/webapp!883))

## 2.9.12-next.1 (2024-08-27)

### Fixed (3 changes)

- [pass current user id for postpone reminder](kchat/webapp@458ccd766b0a5af6b3bad064b125c0df5b95e924) by @boris.trombert ([merge request](kchat/webapp!900))
- [add poll button in the formatting bar that trigger a poll](kchat/webapp@d5b934634e7155db31c5ae634a5d5f73e0497338) by @cyril.gromoff ([merge request](kchat/webapp!451))
- [add the right text when we want to invite a user who is already in the targeted channel](kchat/webapp@362f48692369f73f03d793e16c919a65ab0a0ade) by @cyril.gromoff ([merge request](kchat/webapp!883))

## 2.9.11-rc.4 (2024-08-22)

### Removed (1 change)

- [Revert "Merge branch 'ai-react-for-me' into 'master'"](kchat/webapp@bc14e47471eb904347dc68b66d20f952095a923a) by @antonbuksa

## 2.9.11-rc.3 (2024-08-22)

### Added (1 change)

- [ai react for me button for posts](kchat/webapp@077522a9114bd38c9d65b2babfa39e3efe4fb571) by @boris.trombert ([merge request](kchat/webapp!888))

### Fixed (8 changes)

- [disabled post time link on system message and on bot for desktop](kchat/webapp@f0ad8abd7da79b651041dc70e21243dd0a68524d) by @boris.trombert ([merge request](kchat/webapp!891))
- [hide pending invitations in kChat for external users](kchat/webapp@58316aa863290bfb6bddaf838a44f65d4654f49d) by @cyril.gromoff ([merge request](kchat/webapp!893))
- [correction of the translation to see the transcript](kchat/webapp@58b4952e258547f6a9c50209a3a993318d7dd31a) by @boris.trombert ([merge request](kchat/webapp!892))
- [new style for ai actions modal in posts](kchat/webapp@b5f235fef627aef893744b87eb627f6f55b04bdb) by @boris.trombert ([merge request](kchat/webapp!889))
- [fix CTA alignement for the modals and move checkbox to the left](kchat/webapp@1e4bf4869bc60431c37fe686d9c57b54cf333984) by @cyril.gromoff ([merge request](kchat/webapp!876))
- [summarize button only in thread root message](kchat/webapp@f7d23dd5aef6e693fd38e1b106ec0eab8a705dd4) by @boris.trombert ([merge request](kchat/webapp!887))
- [changing channel from public to private now correctly display the ui](kchat/webapp@22e7074e79eb5cfbf79fde43d0aeb4539851a71e) by @cyril.gromoff ([merge request](kchat/webapp!884))
- [Fix the color of the 'Invite more' button when in dark mode](kchat/webapp@e588e5ca855b7a9ce4a03c1599422257cecae4a9) by @cyril.gromoff ([merge request](kchat/webapp!878))

### Removed (1 change)

- [Revert "Merge branch 'ai-react-for-me' into 'master'"](kchat/webapp@bc14e47471eb904347dc68b66d20f952095a923a) by @antonbuksa

## 2.9.11-rc.2 (2024-08-20)

### Fixed (2 changes)

- [new style for ai actions modal in posts](kchat/webapp@b5f235fef627aef893744b87eb627f6f55b04bdb) by @boris.trombert ([merge request](kchat/webapp!889))
- [fix CTA alignement for the modals and move checkbox to the left](kchat/webapp@1e4bf4869bc60431c37fe686d9c57b54cf333984) by @cyril.gromoff ([merge request](kchat/webapp!876))

## 2.9.11-rc.1 (2024-08-20)

### Added (1 change)

- [ai react for me button for posts](kchat/webapp@077522a9114bd38c9d65b2babfa39e3efe4fb571) by @boris.trombert ([merge request](kchat/webapp!888))

### Fixed (3 changes)

- [summarize button only in thread root message](kchat/webapp@f7d23dd5aef6e693fd38e1b106ec0eab8a705dd4) by @boris.trombert ([merge request](kchat/webapp!887))
- [changing channel from public to private now correctly display the ui](kchat/webapp@22e7074e79eb5cfbf79fde43d0aeb4539851a71e) by @cyril.gromoff ([merge request](kchat/webapp!884))
- [Fix the color of the 'Invite more' button when in dark mode](kchat/webapp@e588e5ca855b7a9ce4a03c1599422257cecae4a9) by @cyril.gromoff ([merge request](kchat/webapp!878))

## 2.9.11-next.3 (2024-08-22)

### Added (1 change)

- [ai react for me button for posts](kchat/webapp@077522a9114bd38c9d65b2babfa39e3efe4fb571) by @boris.trombert ([merge request](kchat/webapp!888))

### Fixed (8 changes)

- [disabled post time link on system message and on bot for desktop](kchat/webapp@f0ad8abd7da79b651041dc70e21243dd0a68524d) by @boris.trombert ([merge request](kchat/webapp!891))
- [hide pending invitations in kChat for external users](kchat/webapp@58316aa863290bfb6bddaf838a44f65d4654f49d) by @cyril.gromoff ([merge request](kchat/webapp!893))
- [correction of the translation to see the transcript](kchat/webapp@58b4952e258547f6a9c50209a3a993318d7dd31a) by @boris.trombert ([merge request](kchat/webapp!892))
- [new style for ai actions modal in posts](kchat/webapp@b5f235fef627aef893744b87eb627f6f55b04bdb) by @boris.trombert ([merge request](kchat/webapp!889))
- [fix CTA alignement for the modals and move checkbox to the left](kchat/webapp@1e4bf4869bc60431c37fe686d9c57b54cf333984) by @cyril.gromoff ([merge request](kchat/webapp!876))
- [summarize button only in thread root message](kchat/webapp@f7d23dd5aef6e693fd38e1b106ec0eab8a705dd4) by @boris.trombert ([merge request](kchat/webapp!887))
- [changing channel from public to private now correctly display the ui](kchat/webapp@22e7074e79eb5cfbf79fde43d0aeb4539851a71e) by @cyril.gromoff ([merge request](kchat/webapp!884))
- [Fix the color of the 'Invite more' button when in dark mode](kchat/webapp@e588e5ca855b7a9ce4a03c1599422257cecae4a9) by @cyril.gromoff ([merge request](kchat/webapp!878))

### Removed (1 change)

- [Revert "Merge branch 'ai-react-for-me' into 'master'"](kchat/webapp@bc14e47471eb904347dc68b66d20f952095a923a) by @antonbuksa

## 2.9.11-next.2 (2024-08-20)

No changes.

## 2.9.11-next.1 (2024-08-20)

### Added (1 change)

- [ai react for me button for posts](kchat/webapp@077522a9114bd38c9d65b2babfa39e3efe4fb571) by @boris.trombert ([merge request](kchat/webapp!888))

### Fixed (5 changes)

- [new style for ai actions modal in posts](kchat/webapp@b5f235fef627aef893744b87eb627f6f55b04bdb) by @boris.trombert ([merge request](kchat/webapp!889))
- [fix CTA alignement for the modals and move checkbox to the left](kchat/webapp@1e4bf4869bc60431c37fe686d9c57b54cf333984) by @cyril.gromoff ([merge request](kchat/webapp!876))
- [summarize button only in thread root message](kchat/webapp@f7d23dd5aef6e693fd38e1b106ec0eab8a705dd4) by @boris.trombert ([merge request](kchat/webapp!887))
- [changing channel from public to private now correctly display the ui](kchat/webapp@22e7074e79eb5cfbf79fde43d0aeb4539851a71e) by @cyril.gromoff ([merge request](kchat/webapp!884))
- [Fix the color of the 'Invite more' button when in dark mode](kchat/webapp@e588e5ca855b7a9ce4a03c1599422257cecae4a9) by @cyril.gromoff ([merge request](kchat/webapp!878))

## 2.9.10-rc.7 (2024-08-16)

### Fixed (1 change)

- [fix integrations link not working on desktop](kchat/webapp@e96101e3cff7085e941962d5dae6e8e2e0c75af7) by @antonbuksa ([merge request](kchat/webapp!885))

## 2.9.10-rc.6 (2024-08-15)

No changes.

## 2.9.10-rc.5 (2024-08-15)

### Added (1 change)

- [optional props isThreadView creating warning and summarize button trad](kchat/webapp@99158a179a5510b72706a93841154273c3af9259) by @antonbuksa ([merge request](kchat/webapp!881))

### Removed (1 change)

- [remove dropdown from desktop team name menu](kchat/webapp@b61f22ec8a711700805da95e7f70cd836fcaf49e) by @antonbuksa ([merge request](kchat/webapp!882))

## 2.9.10-rc.4 (2024-08-15)

### Fixed (1 change)

- [fix env key for sentry var](kchat/webapp@906a530194d106926aa4fa9f2ff76391a456c4b6) by @antonbuksa

## 2.9.10-rc.3 (2024-08-15)

### Added (3 changes)

- [label merge request status in release script](kchat/webapp@3d6bbf58f2697189f432f274fa8760a067bf2e63) by @antonbuksa
- [missing traduction for thread in thread view](kchat/webapp@32e259b813c447a098fb7ec506e8fc9eba45f5e5) by @boris.trombert ([merge request](kchat/webapp!880))
- [add env var for sentry sample rate](kchat/webapp@dd8d4159f1d054b01dac94d9c0d29152c608de32) by @antonbuksa ([merge request](kchat/webapp!877))

## 2.9.10-rc.2 (2024-08-14)

### Fixed (2 changes)

- [test fix for team added flow desktop](kchat/webapp@7d4d1be76625e1904d62478ab5fed70f5bafbecf) by @antonbuksa
- [prevent multiple registrations of AI plugin](kchat/webapp@94e8a796b635a750018aa54ea7cb66741fbf01e8) by @boris.trombert ([merge request](kchat/webapp!874))

## 2.9.10-rc.1 (2024-08-13)

### Added (3 changes)

- [Add: kChat post history](kchat/webapp@fffb12feb58a15ea57169b94e3c8f4ffb943f4bd) by  ([merge request](kchat/webapp!838))
- [Add: Add icons, llmbot post compo and connect compo to post](kchat/webapp@704ec11ca48d2b5561a0f5e06a218acad15e2d7e) by  ([merge request](kchat/webapp!838))
- [implement ai plugin as internal webapp plugin](kchat/webapp@0db68d115c5587a6cf5af3c2d6a35d7b9a401b4c) by @antonbuksa ([merge request](kchat/webapp!838))

### Fixed (5 changes)

- [updating system emojis to add all infomaniak products](kchat/webapp@3da4299e1ecefef3080b9f71a88db0b9c1372663) by @cyril.gromoff ([merge request](kchat/webapp!873))
- [Add: add rhs header buttons](kchat/webapp@188c2b88d2dae521ecb627d8a4e616d279ec85be) by  ([merge request](kchat/webapp!838))
- [Fix: Color font, clean comment and api type](kchat/webapp@ae57f101e59a57d631793e0246664ccb94794d13) by  ([merge request](kchat/webapp!838))
- [Fix: remove post summary help message](kchat/webapp@ef6953849f8079abff13060e203bc9efae98c679) by  ([merge request](kchat/webapp!838))
- [scroll stay in current position when emoji's are loading](kchat/webapp@8bf68c0befaee81dc3839a8f6c5fe1d38cfe80c8) by  ([merge request](kchat/webapp!818))

## 2.9.10-next.4 (2024-08-16)

### Fixed (1 change)

- [fix integrations link not working on desktop](kchat/webapp@e96101e3cff7085e941962d5dae6e8e2e0c75af7) by @antonbuksa ([merge request](kchat/webapp!885))

## 2.9.10-next.3 (2024-08-15)

### Added (1 change)

- [optional props isThreadView creating warning and summarize button trad](kchat/webapp@99158a179a5510b72706a93841154273c3af9259) by @antonbuksa ([merge request](kchat/webapp!881))

### Removed (1 change)

- [remove dropdown from desktop team name menu](kchat/webapp@b61f22ec8a711700805da95e7f70cd836fcaf49e) by @antonbuksa ([merge request](kchat/webapp!882))

## 2.9.10-next.2 (2024-08-15)

### Added (3 changes)

- [label merge request status in release script](kchat/webapp@3d6bbf58f2697189f432f274fa8760a067bf2e63) by @antonbuksa
- [missing traduction for thread in thread view](kchat/webapp@32e259b813c447a098fb7ec506e8fc9eba45f5e5) by @boris.trombert ([merge request](kchat/webapp!880))
- [add env var for sentry sample rate](kchat/webapp@dd8d4159f1d054b01dac94d9c0d29152c608de32) by @antonbuksa ([merge request](kchat/webapp!877))

### Fixed (3 changes)

- [fix env key for sentry var](kchat/webapp@906a530194d106926aa4fa9f2ff76391a456c4b6) by @antonbuksa
- [test fix for team added flow desktop](kchat/webapp@7d4d1be76625e1904d62478ab5fed70f5bafbecf) by @antonbuksa
- [prevent multiple registrations of AI plugin](kchat/webapp@94e8a796b635a750018aa54ea7cb66741fbf01e8) by @boris.trombert ([merge request](kchat/webapp!874))

## 2.9.10-next.1 (2024-08-13)

### Added (3 changes)

- [Add: kChat post history](kchat/webapp@fffb12feb58a15ea57169b94e3c8f4ffb943f4bd) by  ([merge request](kchat/webapp!838))
- [Add: Add icons, llmbot post compo and connect compo to post](kchat/webapp@704ec11ca48d2b5561a0f5e06a218acad15e2d7e) by  ([merge request](kchat/webapp!838))
- [implement ai plugin as internal webapp plugin](kchat/webapp@0db68d115c5587a6cf5af3c2d6a35d7b9a401b4c) by @antonbuksa ([merge request](kchat/webapp!838))

### Fixed (5 changes)

- [updating system emojis to add all infomaniak products](kchat/webapp@3da4299e1ecefef3080b9f71a88db0b9c1372663) by @cyril.gromoff ([merge request](kchat/webapp!873))
- [Add: add rhs header buttons](kchat/webapp@188c2b88d2dae521ecb627d8a4e616d279ec85be) by  ([merge request](kchat/webapp!838))
- [Fix: Color font, clean comment and api type](kchat/webapp@ae57f101e59a57d631793e0246664ccb94794d13) by  ([merge request](kchat/webapp!838))
- [Fix: remove post summary help message](kchat/webapp@ef6953849f8079abff13060e203bc9efae98c679) by  ([merge request](kchat/webapp!838))
- [scroll stay in current position when emoji's are loading](kchat/webapp@8bf68c0befaee81dc3839a8f6c5fe1d38cfe80c8) by  ([merge request](kchat/webapp!818))

## 2.9.9-rc.3 (2024-08-12)

### Added (4 changes)

- [allow app navigation buttons on pwa](kchat/webapp@f65a21d46c7e7eb3d55b439b9e4dc46095c92373) by @boris.trombert ([merge request](kchat/webapp!871))
- [Added: Reminder time](kchat/webapp@53cb90b6aa8c0942b1603cc70597f8c27bf9a540) by  ([merge request](kchat/webapp!850))
- [Fix: create compo for postpone buttons](kchat/webapp@60822b0eca1dcdacddbe52811b5b25058a6eb7a7) by  ([merge request](kchat/webapp!850))
- [Feat: Postpone reminder](kchat/webapp@48a782559152d09e2d141a9bde414369c2459a19) by  ([merge request](kchat/webapp!850))

### Fixed (3 changes)

- [updating emojis name](kchat/webapp@bfa06645d8c8216cd99601d0523739d001d2e124) by @cyril.gromoff ([merge request](kchat/webapp!872))
- [Fix: API call and changes message according to actions](kchat/webapp@71e15f1f0ae8ad43dcf3c24e0f04a4ec90acc06e) by  ([merge request](kchat/webapp!850))
- [Fix: button in post compo instead of post message view compo](kchat/webapp@dba36890123a61327790ffe975a4ba4eeaca88af) by  ([merge request](kchat/webapp!850))

## 2.9.9-rc.2 (2024-08-09)

### Fixed (3 changes)

- [Fix: remove bugtracker color](kchat/webapp@79fd3916717f06b9804f3be4709e9887a8f2feff) by  ([merge request](kchat/webapp!858))
- [add join button in thread instead of readonly message](kchat/webapp@f980fb29e9af84d276d59dab56e9099de34f1812) by  ([merge request](kchat/webapp!868))
- [Fix: Remove bugtracker background for parter organisation](kchat/webapp@d19fb993f9edf25c00db86c22ec77ded85d2383f) by  ([merge request](kchat/webapp!858))

## 2.9.9-rc.1 (2024-08-07)

### Added (2 changes)

- [Added: Create channel tip compo](kchat/webapp@405940170dde6541f5899c39098ca5865f624e7e) by  ([merge request](kchat/webapp!848))
- [Feat: modal for max user in pm](kchat/webapp@bf1b7c87a94dc635b37a1e7ca2e43bf4700b4136) by  ([merge request](kchat/webapp!848))

### Fixed (11 changes)

- [Fix: Missing traduction for leave channel modal](kchat/webapp@dcf4c39bf248c260bbe310a7915e2e443ef11a56) by  ([merge request](kchat/webapp!867))
- [Fix: move modal in more direct channels and pass it in children](kchat/webapp@cde8bec863bd2944aa139033cf51fbb6fd0180f4) by  ([merge request](kchat/webapp!848))
- [Fix: Change create channel modal position](kchat/webapp@2b4fecb6908e78eb51cbd2fe870310a77ec223c4) by  ([merge request](kchat/webapp!848))
- [Fix: Change trad and text position in modal](kchat/webapp@7d23168691a69b756374eb9b9635eb66b7b366bb) by  ([merge request](kchat/webapp!848))
- [Fix: show modal when 7 user in pm](kchat/webapp@7bb296b6e1efa99f6a7fe0355cc65019978cab02) by  ([merge request](kchat/webapp!848))
- [Fix: Missing traduction for post reminder](kchat/webapp@5db19ea4f2646b0814cb50ed5a8513d6183d5648) by  ([merge request](kchat/webapp!862))
- [fix autocomplete for custom emojis](kchat/webapp@eefd5c7559ce6adbb89541001263a04c8dd86aa8) by  ([merge request](kchat/webapp!845))
- [Fix: move modal in more direct channels and pass it in children](kchat/webapp@e93b55ae433818a60a3d1ce286a25861dc6c3992) by  ([merge request](kchat/webapp!848))
- [Fix: Change create channel modal position](kchat/webapp@ed1a0ea0cc89de700c9a5ad879ebbd39a7723266) by  ([merge request](kchat/webapp!848))
- [Fix: Change trad and text position in modal](kchat/webapp@be596919bafe47762373b56c1943025f155a8288) by  ([merge request](kchat/webapp!848))
- [Fix: show modal when 7 user in pm](kchat/webapp@882050971f77e05c52d4cab57a55807fedfa6b53) by  ([merge request](kchat/webapp!848))

### Changed (1 change)

- [disable fetching channel own member on posted event](kchat/webapp@d488f2f23d470252b4beea4580951cabd7ad7a2f) by @antonbuksa ([merge request](kchat/webapp!824))

## 2.9.9-next.3 (2024-08-12)

### Added (4 changes)

- [allow app navigation buttons on pwa](kchat/webapp@f65a21d46c7e7eb3d55b439b9e4dc46095c92373) by @boris.trombert ([merge request](kchat/webapp!871))
- [Added: Reminder time](kchat/webapp@53cb90b6aa8c0942b1603cc70597f8c27bf9a540) by  ([merge request](kchat/webapp!850))
- [Fix: create compo for postpone buttons](kchat/webapp@60822b0eca1dcdacddbe52811b5b25058a6eb7a7) by  ([merge request](kchat/webapp!850))
- [Feat: Postpone reminder](kchat/webapp@48a782559152d09e2d141a9bde414369c2459a19) by  ([merge request](kchat/webapp!850))

### Fixed (3 changes)

- [updating emojis name](kchat/webapp@bfa06645d8c8216cd99601d0523739d001d2e124) by @cyril.gromoff ([merge request](kchat/webapp!872))
- [Fix: API call and changes message according to actions](kchat/webapp@71e15f1f0ae8ad43dcf3c24e0f04a4ec90acc06e) by  ([merge request](kchat/webapp!850))
- [Fix: button in post compo instead of post message view compo](kchat/webapp@dba36890123a61327790ffe975a4ba4eeaca88af) by  ([merge request](kchat/webapp!850))

## 2.9.9-next.2 (2024-08-09)

### Fixed (3 changes)

- [Fix: remove bugtracker color](kchat/webapp@79fd3916717f06b9804f3be4709e9887a8f2feff) by  ([merge request](kchat/webapp!858))
- [add join button in thread instead of readonly message](kchat/webapp@f980fb29e9af84d276d59dab56e9099de34f1812) by  ([merge request](kchat/webapp!868))
- [Fix: Remove bugtracker background for parter organisation](kchat/webapp@d19fb993f9edf25c00db86c22ec77ded85d2383f) by  ([merge request](kchat/webapp!858))

## 2.9.9-next.1 (2024-08-07)

### Added (2 changes)

- [Added: Create channel tip compo](kchat/webapp@405940170dde6541f5899c39098ca5865f624e7e) by  ([merge request](kchat/webapp!848))
- [Feat: modal for max user in pm](kchat/webapp@bf1b7c87a94dc635b37a1e7ca2e43bf4700b4136) by  ([merge request](kchat/webapp!848))

### Fixed (11 changes)

- [Fix: Missing traduction for leave channel modal](kchat/webapp@dcf4c39bf248c260bbe310a7915e2e443ef11a56) by  ([merge request](kchat/webapp!867))
- [Fix: move modal in more direct channels and pass it in children](kchat/webapp@cde8bec863bd2944aa139033cf51fbb6fd0180f4) by  ([merge request](kchat/webapp!848))
- [Fix: Change create channel modal position](kchat/webapp@2b4fecb6908e78eb51cbd2fe870310a77ec223c4) by  ([merge request](kchat/webapp!848))
- [Fix: Change trad and text position in modal](kchat/webapp@7d23168691a69b756374eb9b9635eb66b7b366bb) by  ([merge request](kchat/webapp!848))
- [Fix: show modal when 7 user in pm](kchat/webapp@7bb296b6e1efa99f6a7fe0355cc65019978cab02) by  ([merge request](kchat/webapp!848))
- [Fix: Missing traduction for post reminder](kchat/webapp@5db19ea4f2646b0814cb50ed5a8513d6183d5648) by  ([merge request](kchat/webapp!862))
- [fix autocomplete for custom emojis](kchat/webapp@eefd5c7559ce6adbb89541001263a04c8dd86aa8) by  ([merge request](kchat/webapp!845))
- [Fix: move modal in more direct channels and pass it in children](kchat/webapp@e93b55ae433818a60a3d1ce286a25861dc6c3992) by  ([merge request](kchat/webapp!848))
- [Fix: Change create channel modal position](kchat/webapp@ed1a0ea0cc89de700c9a5ad879ebbd39a7723266) by  ([merge request](kchat/webapp!848))
- [Fix: Change trad and text position in modal](kchat/webapp@be596919bafe47762373b56c1943025f155a8288) by  ([merge request](kchat/webapp!848))
- [Fix: show modal when 7 user in pm](kchat/webapp@882050971f77e05c52d4cab57a55807fedfa6b53) by  ([merge request](kchat/webapp!848))

### Changed (1 change)

- [disable fetching channel own member on posted event](kchat/webapp@d488f2f23d470252b4beea4580951cabd7ad7a2f) by @antonbuksa ([merge request](kchat/webapp!824))

## 2.9.8-rc.5 (2024-08-05)

### Changed (1 change)

- [add temp check to prevent undefined case on latestPost create_at](kchat/webapp@c860209635bdf1862c5835d2571247024e09d21a) by @antonbuksa ([merge request](kchat/webapp!866))

## 2.9.8-rc.4 (2024-08-05)

### Fixed (1 change)

- [Fix: Condition for user not on appstore](kchat/webapp@6e02b35d193e6ba08f056c09aa7db7a730a3c14c) by  ([merge request](kchat/webapp!865))

## 2.9.8-rc.3 (2024-07-31)

### Fixed (2 changes)

- [Fix: Remove link for invite users to team](kchat/webapp@8fac8885713291660d1cd58a57b315ca904f166b) by  ([merge request](kchat/webapp!863))
- [Fix: Remove link for invite external users](kchat/webapp@699c12729c821bfab9cd6c9442de131a9bbbaad3) by  ([merge request](kchat/webapp!863))

## 2.9.8-rc.2 (2024-07-31)

### Fixed (6 changes)

- [Fix: Call declined trad not working](kchat/webapp@ccc389ec94725bc94c641a89d83d446c2bce3ca4) by  ([merge request](kchat/webapp!864))
- [Fix: Transcript text color on dark theme](kchat/webapp@a7b18c9fb8a0e1dafffd28d9892596ec44f1b092) by  ([merge request](kchat/webapp!861))
- [Fix: Remove hover on status dropdown header](kchat/webapp@6ee105500b94a4b344eb9c45d0b12414634fb41c) by  ([merge request](kchat/webapp!860))
- [fixed issue while user list disappeared with autocomplete](kchat/webapp@3e46050f4522ff709a2733f5fd38534e920298ac) by  ([merge request](kchat/webapp!852))
- [Fix: Add arrow for webapp](kchat/webapp@b769f2da0fb0d61267edf399f44c94641c54f25a) by  ([merge request](kchat/webapp!859))
- [fix: prevent closing menu when pressing enter on a menu-item that has a popup](kchat/webapp@7d904e136857f9da0bee6d39670fb5fce9105bca) by @tim.dewinter ([merge request](kchat/webapp!833))

## 2.9.8-rc.1 (2024-07-30)

### Fixed (5 changes)

- [Fix: Member list don't scroll](kchat/webapp@e6a1d366630a2ba458c80b4f595921bb1c8a8dee) by  ([merge request](kchat/webapp!856))
- [fix markdown image that not showing up in thread](kchat/webapp@eea52ef6c20c2d7a600e4e9965707c05fdbfd982) by  ([merge request](kchat/webapp!849))
- [Fix: add status in group list modal](kchat/webapp@1cd002c23460212b4edbf4c79cec38a7c5755a5a) by  ([merge request](kchat/webapp!846))
- [Feat: Add status in group member](kchat/webapp@b25f6bb122cf90d9aaeda301d61e66b601f481d4) by  ([merge request](kchat/webapp!846))
- [fix: add hide module support](kchat/webapp@8b74bea20f38114eff02b3d108228fd67c286d58) by  ([merge request](kchat/webapp!809))

## 2.9.8-next.5 (2024-08-05)

### Changed (1 change)

- [add temp check to prevent undefined case on latestPost create_at](kchat/webapp@c860209635bdf1862c5835d2571247024e09d21a) by @antonbuksa ([merge request](kchat/webapp!866))

## 2.9.8-next.4 (2024-08-05)

### Fixed (1 change)

- [Fix: Condition for user not on appstore](kchat/webapp@6e02b35d193e6ba08f056c09aa7db7a730a3c14c) by  ([merge request](kchat/webapp!865))

## 2.9.8-next.3 (2024-07-31)

### Fixed (2 changes)

- [Fix: Remove link for invite users to team](kchat/webapp@8fac8885713291660d1cd58a57b315ca904f166b) by  ([merge request](kchat/webapp!863))
- [Fix: Remove link for invite external users](kchat/webapp@699c12729c821bfab9cd6c9442de131a9bbbaad3) by  ([merge request](kchat/webapp!863))

## 2.9.8-next.2 (2024-07-31)

### Fixed (6 changes)

- [Fix: Call declined trad not working](kchat/webapp@ccc389ec94725bc94c641a89d83d446c2bce3ca4) by  ([merge request](kchat/webapp!864))
- [Fix: Transcript text color on dark theme](kchat/webapp@a7b18c9fb8a0e1dafffd28d9892596ec44f1b092) by  ([merge request](kchat/webapp!861))
- [Fix: Remove hover on status dropdown header](kchat/webapp@6ee105500b94a4b344eb9c45d0b12414634fb41c) by  ([merge request](kchat/webapp!860))
- [fixed issue while user list disappeared with autocomplete](kchat/webapp@3e46050f4522ff709a2733f5fd38534e920298ac) by  ([merge request](kchat/webapp!852))
- [Fix: Add arrow for webapp](kchat/webapp@b769f2da0fb0d61267edf399f44c94641c54f25a) by  ([merge request](kchat/webapp!859))
- [fix: prevent closing menu when pressing enter on a menu-item that has a popup](kchat/webapp@7d904e136857f9da0bee6d39670fb5fce9105bca) by @tim.dewinter ([merge request](kchat/webapp!833))

## 2.9.8-next.1 (2024-07-30)

### Fixed (5 changes)

- [Fix: Member list don't scroll](kchat/webapp@e6a1d366630a2ba458c80b4f595921bb1c8a8dee) by  ([merge request](kchat/webapp!856))
- [fix markdown image that not showing up in thread](kchat/webapp@eea52ef6c20c2d7a600e4e9965707c05fdbfd982) by  ([merge request](kchat/webapp!849))
- [Fix: add status in group list modal](kchat/webapp@1cd002c23460212b4edbf4c79cec38a7c5755a5a) by  ([merge request](kchat/webapp!846))
- [Feat: Add status in group member](kchat/webapp@b25f6bb122cf90d9aaeda301d61e66b601f481d4) by  ([merge request](kchat/webapp!846))
- [fix: add hide module support](kchat/webapp@8b74bea20f38114eff02b3d108228fd67c286d58) by  ([merge request](kchat/webapp!809))

## 2.9.7-rc.10 (2024-07-24)

### Changed (1 change)

- [fix(call): Updated ringtone](kchat/webapp@c8b4b62b6743ce524172e7f239767a08c4699ad0) by @tim.dewinter ([merge request](kchat/webapp!853))

## 2.9.7-rc.9 (2024-07-23)

### Changed (1 change)

- [fix(call): Updated ringtone](kchat/webapp@2dd0d34454cc479f2513cd462c7b87300ce93a2b) by @tim.dewinter ([merge request](kchat/webapp!817))

## 2.9.7-rc.8 (2024-07-22)

### Changed (1 change)

- [make adaptations for ksuite spaces](kchat/webapp@3227f3d7ed2fb712342f52cd95c51eab822cb5aa) by @antonbuksa ([merge request](kchat/webapp!826))

## 2.9.7-rc.7 (2024-07-18)

### Fixed (1 change)

- [add check for empty array in transcript popover](kchat/webapp@b5e03da4c1d074cf992582ea822cb5c4c15c260f) by @antonbuksa

## 2.9.7-rc.6 (2024-07-18)

### Fixed (1 change)

- [fix trim js error in transcript popover](kchat/webapp@cde30700e59730412320a4e866c236083522b546) by @antonbuksa

## 2.9.7-rc.5 (2024-07-18)

### Fixed (6 changes)

- [Fix: New MUI component for transcript](kchat/webapp@f9b7373e809bd0507bffc10699a4053cabb725cd) by  ([merge request](kchat/webapp!796))
- [Fix: Responsive according to popover size](kchat/webapp@e06d7e1f6c4ece63bd6bbe0940a14f609c3de3cf) by  ([merge request](kchat/webapp!796))
- [Fix: New responsive component for transcript](kchat/webapp@311333c1ee9a112073e9fb5a3494f10089dc6a8b) by  ([merge request](kchat/webapp!796))
- [Fix: New MUI component for transcript](kchat/webapp@fe08003d46303adce4ab2d517ca9690f5c02b759) by  ([merge request](kchat/webapp!796))
- [Fix: Responsive according to popover size](kchat/webapp@107a018b005e4b3b13cb3b99a56fa466aca452c2) by  ([merge request](kchat/webapp!796))
- [Fix: New responsive component for transcript](kchat/webapp@29a0e1e8366938d4362f04a452829ad368d17a43) by  ([merge request](kchat/webapp!796))

### Changed (1 change)

- [refactor websocket binding](kchat/webapp@522a0b8b7e367ee3d4853ee581b0024f78433545) by @antonbuksa ([merge request](kchat/webapp!847))

## 2.9.7-rc.4 (2024-07-17)

### Added (2 changes)

- [chore: double custom status emoji tooltip size if it does not expires](kchat/webapp@71d6fa59748ff8d2ee6d5ab7cd6bca5d727e4afb) by @tim.dewinter ([merge request](kchat/webapp!825))
- [chore: double custom status emoji tooltip size if it does not expires](kchat/webapp@035df97ecd109f61f2dffc13f752d99fa91d0cf4) by @tim.dewinter ([merge request](kchat/webapp!839))

### Fixed (34 changes)

- [Fix: multiselect disappear when no input](kchat/webapp@29de75ec95833ed200a1e6e924503397be1386d2) by  ([merge request](kchat/webapp!825))
- [updating reaction limit reached modal text and add missing translation. es fr it](kchat/webapp@59395d184a993932b7ef1e20e12907ee7500b808) by  ([merge request](kchat/webapp!825))
- [Fix: Create ik file for feature](kchat/webapp@5e20d6d1ad12190e2eba7c38b9d2cdfb85ee1836) by  ([merge request](kchat/webapp!825))
- [updating reaction limit reached modal text and add missing translation. es fr it](kchat/webapp@a18b9c69b58a1972ac6549638fc3c0a4468de2a6) by  ([merge request](kchat/webapp!840))
- [change incoming webhooks redirection in integration doc](kchat/webapp@b0280e1abd7138edffe6721bf9e1f273948b4a86) by  ([merge request](kchat/webapp!825))
- [Fix: remove props and use class instead](kchat/webapp@3773a9b9ac698f4ba43e0d771c2cb9dc9f5ee2b3) by  ([merge request](kchat/webapp!825))
- [Fix: Border radius only for newReplies](kchat/webapp@3b63c00a5afe3256140150f9ccf08c1be85d0aca) by  ([merge request](kchat/webapp!825))
- [Fix: Remove border-radius for hover](kchat/webapp@29ee2f677ae691c59c702403b259202f6ae6a438) by  ([merge request](kchat/webapp!825))
- [add fr translation for threadFromArchivedChannelMessage](kchat/webapp@eb31131c7e24839af4c5ad85179defc2fb97bc98) by  ([merge request](kchat/webapp!825))
- [Fix: use debounce and transient ref instead of setTimeout](kchat/webapp@cec145a7d14969de24b6f95019f40cba63027963) by  ([merge request](kchat/webapp!825))
- [Fix: Add skeleton and fix errors](kchat/webapp@9bdcb8afd9ed9fb1a9b980b308de5003471ff540) by  ([merge request](kchat/webapp!825))
- [Fix: remove self role change when only 1 admin is in channel](kchat/webapp@6e6ba8c638bf49758d80f6655a2ff13afbeaa912) by  ([merge request](kchat/webapp!825))
- [change incoming webhooks redirection in integration doc](kchat/webapp@6170a84347af763a9a83b3d3513597fdc8215755) by  ([merge request](kchat/webapp!842))
- [add fr translation for threadFromArchivedChannelMessage](kchat/webapp@1ce3781b0773051bc1f3ca515ca04b5cdde28754) by  ([merge request](kchat/webapp!841))
- [Fix: Only use channel id in params of selector](kchat/webapp@a516e2153f266999bbb920514da683beb4200757) by  ([merge request](kchat/webapp!825))
- [Fix: Remove promise all and add await on request in useEffect](kchat/webapp@27ebe6d53bf19f0c4b8962d6deb05eed745f45e1) by  ([merge request](kchat/webapp!825))
- [Fix: add selector instead of doing computation in component](kchat/webapp@63b4c2819a0b3c7cd4659cc74882df5edf38c4fc) by  ([merge request](kchat/webapp!825))
- [Fix: remove props and use class instead](kchat/webapp@f7ff2899f6c581f3067950d051aa766e698ca502) by  ([merge request](kchat/webapp!835))
- [Fix: Use .some to avoid using an array](kchat/webapp@aa7757ea17ed70f49768249ed3da72a34c0e3d68) by  ([merge request](kchat/webapp!825))
- [Fix: Remove inherit color for set admin button in channel](kchat/webapp@24fa20f0ffc7eefa3673b33edbc0e1c494c1ec5b) by  ([merge request](kchat/webapp!825))
- [Fix: Border radius only for newReplies](kchat/webapp@54752788107b697a703d29dc3bd95db51ff11cb8) by  ([merge request](kchat/webapp!835))
- [Fix: Remove border-radius for hover](kchat/webapp@f211f9bcfbe4899277067aaba814b843f7e6ac30) by  ([merge request](kchat/webapp!835))
- [fix(ci): e2e report notify channel should be NOTIFY_CHANNEL instead of GUILD](kchat/webapp@653d68afe85f8ea97fd83d6a985ec9fe656fa48f) by @tim.dewinter ([merge request](kchat/webapp!825))
- [rebind last used channel presence on ws reconnect](kchat/webapp@eec085f07458edf80b50791a828801808e0fd994) by @antonbuksa ([merge request](kchat/webapp!825))
- [avoiding guestUser to see integration tab](kchat/webapp@2b21700e0caf67305e9d6c86910c984862d6dda2) by  ([merge request](kchat/webapp!825))
- [fix(ci): trigger unit-test on merge request commits](kchat/webapp@79beedd415436a42f5cd8fac059b1534b2ea0fe6) by @tim.dewinter ([merge request](kchat/webapp!825))
- [Fix: Add props to multiselect to render option on mount and tests](kchat/webapp@175c4079c2f00e8b41eb091cc5742d5edf0f91c8) by  ([merge request](kchat/webapp!825))
- [fix: prevent registerInternalKdrivePlugin from being called multiple times](kchat/webapp@410a1e548f05a3c826cbaad5444cd9eda1f68628) by @tim.dewinter ([merge request](kchat/webapp!831))
- [Fix: only fetch is you are channel admin](kchat/webapp@e8cba5f181734ca5faf9bd7dc9076710441db25c) by  ([merge request](kchat/webapp!825))
- [Fix: Condition by checking member permission](kchat/webapp@f07dc16c5069a52b58698bb76509d905634629cc) by  ([merge request](kchat/webapp!825))
- [Fix: Condition to display modal and tests](kchat/webapp@f253614db1cf4f3570bbfb5e6e67bf416d442441) by  ([merge request](kchat/webapp!825))
- [Fix: Remove current user from options](kchat/webapp@3166e837414c985d1ebbcb7cb56c9b6e0434b7c4) by  ([merge request](kchat/webapp!825))
- [Fix: remove useless span](kchat/webapp@e9f28ad83371b4b112a2938a93d27945f8494c68) by  ([merge request](kchat/webapp!825))
- [Fix: Modal text position](kchat/webapp@130f453215162153cbbd4b6d04940e00b1a492ff) by  ([merge request](kchat/webapp!825))

### Chore (1 change)

- [split test steps for coverage reports to work](kchat/webapp@7497ed64ae9592babbef5db367820fdbab13362a) by @antonbuksa ([merge request](kchat/webapp!825))

### feat (2 changes)

- [Feat: Set condition when there is one admin + traduction](kchat/webapp@c9f6346597d731e9abd89ac76b60e40fc5be73a7) by  ([merge request](kchat/webapp!825))
- [Feat: last admin impossible to leave channel](kchat/webapp@d05a4c57d63ccfa87b78ee044f349b9cae9c86f6) by  ([merge request](kchat/webapp!825))

## 2.9.7-rc.3 (2024-07-11)

### Fixed (1 change)

- [Fix: Remove inherit color for set admin button in channel](kchat/webapp@f5fec3723e32913eac8667c97c7fa3b7646db60c) by  ([merge request](kchat/webapp!834))

## 2.9.7-rc.2 (2024-07-10)

### Fixed (2 changes)

- [rebind last used channel presence on ws reconnect](kchat/webapp@89dd9457c11d730d52e78e499177e7c61e5e90bb) by @antonbuksa ([merge request](kchat/webapp!829))
- [fix(ci): e2e report notify channel should be NOTIFY_CHANNEL instead of GUILD](kchat/webapp@4ae1657e3dfb70740fb43f61a4cf2bddbf8d9504) by @tim.dewinter ([merge request](kchat/webapp!828))

## 2.9.7-rc.1 (2024-07-10)

### Added (2 changes)

- [Add support for actions in the unreads bar from plugins (#24265)](kchat/webapp@9d622e946a45a72e060d44c41ed96c7c54529b98) by @antonbuksa
- [feat(e2e): added playwright ci](kchat/webapp@23c4043f16ade5d62ee839438b51f0d2962a4376) by @tim.dewinter ([merge request](kchat/webapp!783))

### Fixed (11 changes)

- [avoiding guestUser to see integration tab](kchat/webapp@d1997809fc5e2fea10d0c8c73f63861b0f381471) by  ([merge request](kchat/webapp!819))
- [fix(ci): trigger unit-test on merge request commits](kchat/webapp@efc8f2e9ec248bb52649b71058f0cb8afa25e572) by @tim.dewinter ([merge request](kchat/webapp!827))
- [unsubscribe and unbind channels on ws error](kchat/webapp@6623f94fa0796a920980cb59f53faa76f02e3548) by @antonbuksa ([merge request](kchat/webapp!822))
- [remove unused props](kchat/webapp@4c051eb032742cdfc8ccdd5003d30736fed89666) by  ([merge request](kchat/webapp!815))
- [move intégration button to new tab](kchat/webapp@e3209319e2f97c9bb2c122b815dcd3c7b3286153) by  ([merge request](kchat/webapp!815))
- [better implementation to prevents admin user to write in thread channel while not joining it](kchat/webapp@25245e858adbdf310a2da441eba361d77b73420a) by  ([merge request](kchat/webapp!811))
- [fixed issue when we could write in a thread even if we didn't join a channel (if we are admin)](kchat/webapp@607cadd585e4381dc482d47548c2584a8e56f9f1) by  ([merge request](kchat/webapp!811))
- [fix wpack error caused by old prop](kchat/webapp@8179af9cd24e279c8b1a51c5279f82c9ccd5e7d4) by @antonbuksa
- [Fix: Scroll for long text in edit messages and in post](kchat/webapp@04b6213be438b451f7728e1e1d8289ebfa5eccce) by  ([merge request](kchat/webapp!791))
- [add LofoutMessageKey to fix the Iframe error](kchat/webapp@dda9b6859b10b9c031bdb46a9fb8fa3906763c9f) by  ([merge request](kchat/webapp!812))
- [fix: sent messages sometimes coming back as drafts](kchat/webapp@f7b7859d4c6d0257a75b06711ded8c9a2e28f99a) by @tim.dewinter ([merge request](kchat/webapp!783))

### Changed (3 changes)

- [improve ws logs](kchat/webapp@524bc9ce0c72c8818df46a7bd9527ed3c41c3a0c) by @antonbuksa ([merge request](kchat/webapp!822))
- [test disable wakeup checker](kchat/webapp@9fe2d814d1b58ef9ea86b6d74c6a10e8737919f6) by @antonbuksa
- [use pusher integrated reconnect to try fix sleeping reconnects](kchat/webapp@428b44792ac6540b6052b560842490f2716a53fe) by @antonbuksa ([merge request](kchat/webapp!802))

### Removed (1 change)

- [do not send new mattermost presence events](kchat/webapp@eb3f950b2ff69b6256106dfc95252c3e3f793508) by @antonbuksa ([merge request](kchat/webapp!802))

### Chore (1 change)

- [split test steps for coverage reports to work](kchat/webapp@a1374068e5164f93e6353dc9a2ab25c0f22cf8d6) by @antonbuksa ([merge request](kchat/webapp!827))

## 2.9.7-next.4 (2024-07-24)

### Changed (1 change)

- [fix(call): Updated ringtone](kchat/webapp@c8b4b62b6743ce524172e7f239767a08c4699ad0) by @tim.dewinter ([merge request](kchat/webapp!853))

## 2.9.7-next.3 (2024-07-23)

### Changed (2 changes)

- [make adaptations for ksuite spaces](kchat/webapp@3227f3d7ed2fb712342f52cd95c51eab822cb5aa) by @antonbuksa ([merge request](kchat/webapp!826))
- [fix(call): Updated ringtone](kchat/webapp@2dd0d34454cc479f2513cd462c7b87300ce93a2b) by @tim.dewinter ([merge request](kchat/webapp!817))

## 2.9.7-next.2 (2024-07-18)

### Added (2 changes)

- [chore: double custom status emoji tooltip size if it does not expires](kchat/webapp@71d6fa59748ff8d2ee6d5ab7cd6bca5d727e4afb) by @tim.dewinter ([merge request](kchat/webapp!825))
- [chore: double custom status emoji tooltip size if it does not expires](kchat/webapp@035df97ecd109f61f2dffc13f752d99fa91d0cf4) by @tim.dewinter ([merge request](kchat/webapp!839))

### Fixed (42 changes)

- [add check for empty array in transcript popover](kchat/webapp@b5e03da4c1d074cf992582ea822cb5c4c15c260f) by @antonbuksa
- [fix trim js error in transcript popover](kchat/webapp@cde30700e59730412320a4e866c236083522b546) by @antonbuksa
- [Fix: multiselect disappear when no input](kchat/webapp@29de75ec95833ed200a1e6e924503397be1386d2) by  ([merge request](kchat/webapp!825))
- [updating reaction limit reached modal text and add missing translation. es fr it](kchat/webapp@59395d184a993932b7ef1e20e12907ee7500b808) by  ([merge request](kchat/webapp!825))
- [Fix: Create ik file for feature](kchat/webapp@5e20d6d1ad12190e2eba7c38b9d2cdfb85ee1836) by  ([merge request](kchat/webapp!825))
- [updating reaction limit reached modal text and add missing translation. es fr it](kchat/webapp@a18b9c69b58a1972ac6549638fc3c0a4468de2a6) by  ([merge request](kchat/webapp!840))
- [change incoming webhooks redirection in integration doc](kchat/webapp@b0280e1abd7138edffe6721bf9e1f273948b4a86) by  ([merge request](kchat/webapp!825))
- [Fix: remove props and use class instead](kchat/webapp@3773a9b9ac698f4ba43e0d771c2cb9dc9f5ee2b3) by  ([merge request](kchat/webapp!825))
- [Fix: Border radius only for newReplies](kchat/webapp@3b63c00a5afe3256140150f9ccf08c1be85d0aca) by  ([merge request](kchat/webapp!825))
- [Fix: Remove border-radius for hover](kchat/webapp@29ee2f677ae691c59c702403b259202f6ae6a438) by  ([merge request](kchat/webapp!825))
- [add fr translation for threadFromArchivedChannelMessage](kchat/webapp@eb31131c7e24839af4c5ad85179defc2fb97bc98) by  ([merge request](kchat/webapp!825))
- [Fix: use debounce and transient ref instead of setTimeout](kchat/webapp@cec145a7d14969de24b6f95019f40cba63027963) by  ([merge request](kchat/webapp!825))
- [Fix: Add skeleton and fix errors](kchat/webapp@9bdcb8afd9ed9fb1a9b980b308de5003471ff540) by  ([merge request](kchat/webapp!825))
- [Fix: remove self role change when only 1 admin is in channel](kchat/webapp@6e6ba8c638bf49758d80f6655a2ff13afbeaa912) by  ([merge request](kchat/webapp!825))
- [change incoming webhooks redirection in integration doc](kchat/webapp@6170a84347af763a9a83b3d3513597fdc8215755) by  ([merge request](kchat/webapp!842))
- [add fr translation for threadFromArchivedChannelMessage](kchat/webapp@1ce3781b0773051bc1f3ca515ca04b5cdde28754) by  ([merge request](kchat/webapp!841))
- [Fix: Only use channel id in params of selector](kchat/webapp@a516e2153f266999bbb920514da683beb4200757) by  ([merge request](kchat/webapp!825))
- [Fix: Remove promise all and add await on request in useEffect](kchat/webapp@27ebe6d53bf19f0c4b8962d6deb05eed745f45e1) by  ([merge request](kchat/webapp!825))
- [Fix: add selector instead of doing computation in component](kchat/webapp@63b4c2819a0b3c7cd4659cc74882df5edf38c4fc) by  ([merge request](kchat/webapp!825))
- [Fix: remove props and use class instead](kchat/webapp@f7ff2899f6c581f3067950d051aa766e698ca502) by  ([merge request](kchat/webapp!835))
- [Fix: Use .some to avoid using an array](kchat/webapp@aa7757ea17ed70f49768249ed3da72a34c0e3d68) by  ([merge request](kchat/webapp!825))
- [Fix: Remove inherit color for set admin button in channel](kchat/webapp@24fa20f0ffc7eefa3673b33edbc0e1c494c1ec5b) by  ([merge request](kchat/webapp!825))
- [Fix: Border radius only for newReplies](kchat/webapp@54752788107b697a703d29dc3bd95db51ff11cb8) by  ([merge request](kchat/webapp!835))
- [Fix: Remove border-radius for hover](kchat/webapp@f211f9bcfbe4899277067aaba814b843f7e6ac30) by  ([merge request](kchat/webapp!835))
- [fix(ci): e2e report notify channel should be NOTIFY_CHANNEL instead of GUILD](kchat/webapp@653d68afe85f8ea97fd83d6a985ec9fe656fa48f) by @tim.dewinter ([merge request](kchat/webapp!825))
- [rebind last used channel presence on ws reconnect](kchat/webapp@eec085f07458edf80b50791a828801808e0fd994) by @antonbuksa ([merge request](kchat/webapp!825))
- [avoiding guestUser to see integration tab](kchat/webapp@2b21700e0caf67305e9d6c86910c984862d6dda2) by  ([merge request](kchat/webapp!825))
- [fix(ci): trigger unit-test on merge request commits](kchat/webapp@79beedd415436a42f5cd8fac059b1534b2ea0fe6) by @tim.dewinter ([merge request](kchat/webapp!825))
- [Fix: Add props to multiselect to render option on mount and tests](kchat/webapp@175c4079c2f00e8b41eb091cc5742d5edf0f91c8) by  ([merge request](kchat/webapp!825))
- [fix: prevent registerInternalKdrivePlugin from being called multiple times](kchat/webapp@410a1e548f05a3c826cbaad5444cd9eda1f68628) by @tim.dewinter ([merge request](kchat/webapp!831))
- [Fix: only fetch is you are channel admin](kchat/webapp@e8cba5f181734ca5faf9bd7dc9076710441db25c) by  ([merge request](kchat/webapp!825))
- [Fix: Condition by checking member permission](kchat/webapp@f07dc16c5069a52b58698bb76509d905634629cc) by  ([merge request](kchat/webapp!825))
- [Fix: Condition to display modal and tests](kchat/webapp@f253614db1cf4f3570bbfb5e6e67bf416d442441) by  ([merge request](kchat/webapp!825))
- [Fix: Remove current user from options](kchat/webapp@3166e837414c985d1ebbcb7cb56c9b6e0434b7c4) by  ([merge request](kchat/webapp!825))
- [Fix: remove useless span](kchat/webapp@e9f28ad83371b4b112a2938a93d27945f8494c68) by  ([merge request](kchat/webapp!825))
- [Fix: Modal text position](kchat/webapp@130f453215162153cbbd4b6d04940e00b1a492ff) by  ([merge request](kchat/webapp!825))
- [Fix: New MUI component for transcript](kchat/webapp@f9b7373e809bd0507bffc10699a4053cabb725cd) by  ([merge request](kchat/webapp!796))
- [Fix: Responsive according to popover size](kchat/webapp@e06d7e1f6c4ece63bd6bbe0940a14f609c3de3cf) by  ([merge request](kchat/webapp!796))
- [Fix: New responsive component for transcript](kchat/webapp@311333c1ee9a112073e9fb5a3494f10089dc6a8b) by  ([merge request](kchat/webapp!796))
- [Fix: New MUI component for transcript](kchat/webapp@fe08003d46303adce4ab2d517ca9690f5c02b759) by  ([merge request](kchat/webapp!796))
- [Fix: Responsive according to popover size](kchat/webapp@107a018b005e4b3b13cb3b99a56fa466aca452c2) by  ([merge request](kchat/webapp!796))
- [Fix: New responsive component for transcript](kchat/webapp@29a0e1e8366938d4362f04a452829ad368d17a43) by  ([merge request](kchat/webapp!796))

### Changed (1 change)

- [refactor websocket binding](kchat/webapp@522a0b8b7e367ee3d4853ee581b0024f78433545) by @antonbuksa ([merge request](kchat/webapp!847))

### Chore (1 change)

- [split test steps for coverage reports to work](kchat/webapp@7497ed64ae9592babbef5db367820fdbab13362a) by @antonbuksa ([merge request](kchat/webapp!825))

### feat (2 changes)

- [Feat: Set condition when there is one admin + traduction](kchat/webapp@c9f6346597d731e9abd89ac76b60e40fc5be73a7) by  ([merge request](kchat/webapp!825))
- [Feat: last admin impossible to leave channel](kchat/webapp@d05a4c57d63ccfa87b78ee044f349b9cae9c86f6) by  ([merge request](kchat/webapp!825))

## 2.9.7-next.1 (2024-07-12)

### Added (2 changes)

- [Add support for actions in the unreads bar from plugins (#24265)](kchat/webapp@9d622e946a45a72e060d44c41ed96c7c54529b98) by @antonbuksa
- [feat(e2e): added playwright ci](kchat/webapp@23c4043f16ade5d62ee839438b51f0d2962a4376) by @tim.dewinter ([merge request](kchat/webapp!783))

### Fixed (14 changes)

- [Fix: Remove inherit color for set admin button in channel](kchat/webapp@f5fec3723e32913eac8667c97c7fa3b7646db60c) by  ([merge request](kchat/webapp!834))
- [rebind last used channel presence on ws reconnect](kchat/webapp@89dd9457c11d730d52e78e499177e7c61e5e90bb) by @antonbuksa ([merge request](kchat/webapp!829))
- [fix(ci): e2e report notify channel should be NOTIFY_CHANNEL instead of GUILD](kchat/webapp@4ae1657e3dfb70740fb43f61a4cf2bddbf8d9504) by @tim.dewinter ([merge request](kchat/webapp!828))
- [avoiding guestUser to see integration tab](kchat/webapp@d1997809fc5e2fea10d0c8c73f63861b0f381471) by  ([merge request](kchat/webapp!819))
- [fix(ci): trigger unit-test on merge request commits](kchat/webapp@efc8f2e9ec248bb52649b71058f0cb8afa25e572) by @tim.dewinter ([merge request](kchat/webapp!827))
- [unsubscribe and unbind channels on ws error](kchat/webapp@6623f94fa0796a920980cb59f53faa76f02e3548) by @antonbuksa ([merge request](kchat/webapp!822))
- [remove unused props](kchat/webapp@4c051eb032742cdfc8ccdd5003d30736fed89666) by  ([merge request](kchat/webapp!815))
- [move intégration button to new tab](kchat/webapp@e3209319e2f97c9bb2c122b815dcd3c7b3286153) by  ([merge request](kchat/webapp!815))
- [better implementation to prevents admin user to write in thread channel while not joining it](kchat/webapp@25245e858adbdf310a2da441eba361d77b73420a) by  ([merge request](kchat/webapp!811))
- [fixed issue when we could write in a thread even if we didn't join a channel (if we are admin)](kchat/webapp@607cadd585e4381dc482d47548c2584a8e56f9f1) by  ([merge request](kchat/webapp!811))
- [fix wpack error caused by old prop](kchat/webapp@8179af9cd24e279c8b1a51c5279f82c9ccd5e7d4) by @antonbuksa
- [Fix: Scroll for long text in edit messages and in post](kchat/webapp@04b6213be438b451f7728e1e1d8289ebfa5eccce) by  ([merge request](kchat/webapp!791))
- [add LofoutMessageKey to fix the Iframe error](kchat/webapp@dda9b6859b10b9c031bdb46a9fb8fa3906763c9f) by  ([merge request](kchat/webapp!812))
- [fix: sent messages sometimes coming back as drafts](kchat/webapp@f7b7859d4c6d0257a75b06711ded8c9a2e28f99a) by @tim.dewinter ([merge request](kchat/webapp!783))

### Changed (3 changes)

- [improve ws logs](kchat/webapp@524bc9ce0c72c8818df46a7bd9527ed3c41c3a0c) by @antonbuksa ([merge request](kchat/webapp!822))
- [test disable wakeup checker](kchat/webapp@9fe2d814d1b58ef9ea86b6d74c6a10e8737919f6) by @antonbuksa
- [use pusher integrated reconnect to try fix sleeping reconnects](kchat/webapp@428b44792ac6540b6052b560842490f2716a53fe) by @antonbuksa ([merge request](kchat/webapp!802))

### Removed (1 change)

- [do not send new mattermost presence events](kchat/webapp@eb3f950b2ff69b6256106dfc95252c3e3f793508) by @antonbuksa ([merge request](kchat/webapp!802))

### Chore (1 change)

- [split test steps for coverage reports to work](kchat/webapp@a1374068e5164f93e6353dc9a2ab25c0f22cf8d6) by @antonbuksa ([merge request](kchat/webapp!827))

## 2.9.6-rc.6 (2024-07-02)

No changes.

## 2.9.6-rc.5 (2024-07-02)

No changes.

## 2.9.6-rc.4 (2024-06-27)

### Changed (1 change)

- [test disable wakeup checker](kchat/webapp@9fe2d814d1b58ef9ea86b6d74c6a10e8737919f6) by @antonbuksa

## 2.9.6-rc.3 (2024-06-26)

### Changed (1 change)

- [use pusher integrated reconnect to try fix sleeping reconnects](kchat/webapp@428b44792ac6540b6052b560842490f2716a53fe) by @antonbuksa ([merge request](kchat/webapp!802))

### Removed (1 change)

- [do not send new mattermost presence events](kchat/webapp@eb3f950b2ff69b6256106dfc95252c3e3f793508) by @antonbuksa ([merge request](kchat/webapp!802))

## 2.9.6-rc.2 (2024-06-25)

### Fixed (2 changes)

- [remove unused props](kchat/webapp@4c051eb032742cdfc8ccdd5003d30736fed89666) by  ([merge request](kchat/webapp!815))
- [move intégration button to new tab](kchat/webapp@e3209319e2f97c9bb2c122b815dcd3c7b3286153) by  ([merge request](kchat/webapp!815))

## 2.9.6-rc.1 (2024-06-25)

### Fixed (3 changes)

- [better implementation to prevents admin user to write in thread channel while not joining it](kchat/webapp@25245e858adbdf310a2da441eba361d77b73420a) by  ([merge request](kchat/webapp!811))
- [fixed issue when we could write in a thread even if we didn't join a channel (if we are admin)](kchat/webapp@607cadd585e4381dc482d47548c2584a8e56f9f1) by  ([merge request](kchat/webapp!811))
- [add LofoutMessageKey to fix the Iframe error](kchat/webapp@dda9b6859b10b9c031bdb46a9fb8fa3906763c9f) by  ([merge request](kchat/webapp!812))

## 2.9.6-next.2 (2024-07-02)

### Fixed (2 changes)

- [remove unused props](kchat/webapp@4c051eb032742cdfc8ccdd5003d30736fed89666) by  ([merge request](kchat/webapp!815))
- [move intégration button to new tab](kchat/webapp@e3209319e2f97c9bb2c122b815dcd3c7b3286153) by  ([merge request](kchat/webapp!815))

### Changed (2 changes)

- [test disable wakeup checker](kchat/webapp@9fe2d814d1b58ef9ea86b6d74c6a10e8737919f6) by @antonbuksa
- [use pusher integrated reconnect to try fix sleeping reconnects](kchat/webapp@428b44792ac6540b6052b560842490f2716a53fe) by @antonbuksa ([merge request](kchat/webapp!802))

### Removed (1 change)

- [do not send new mattermost presence events](kchat/webapp@eb3f950b2ff69b6256106dfc95252c3e3f793508) by @antonbuksa ([merge request](kchat/webapp!802))

## 2.9.6-next.1 (2024-06-21)

No changes.

## 2.9.5-rc.8 (2024-06-21)

### Added (1 change)

- [Add support for actions in the unreads bar from plugins (#24265)](kchat/webapp@9d622e946a45a72e060d44c41ed96c7c54529b98) by @antonbuksa

### Fixed (2 changes)

- [fix wpack error caused by old prop](kchat/webapp@8179af9cd24e279c8b1a51c5279f82c9ccd5e7d4) by @antonbuksa
- [Fix: Scroll for long text in edit messages and in post](kchat/webapp@04b6213be438b451f7728e1e1d8289ebfa5eccce) by  ([merge request](kchat/webapp!791))

## 2.9.5-rc.7 (2024-06-20)

### Fixed (1 change)

- [fix js error in old calls code](kchat/webapp@aa9a016b40e230b0b5bdd51f3c71de0814e3b70f) by @antonbuksa

## 2.9.5-rc.6 (2024-06-20)

### Fixed (1 change)

- [fix call delete reduce not removing key causing exceptions](kchat/webapp@72dfd65bfe75d315511b354f28b625eb25f837d8) by @antonbuksa

## 2.9.5-rc.5 (2024-06-20)

### Added (1 change)

- [handle case where call no longer exists when answered](kchat/webapp@880c4bf4222c7ae7bf17fd954e087f23144b6359) by @antonbuksa ([merge request](kchat/webapp!808))

## 2.9.5-rc.4 (2024-06-20)

### Added (1 change)

- [retry ws channel subscriptions if error occurs](kchat/webapp@14d4a3ddd72001511b92aa3b4321ba670d5e8ede) by @antonbuksa ([merge request](kchat/webapp!810))

## 2.9.5-rc.3 (2024-06-19)

### Fixed (1 change)

- [fix: close actions now close menu](kchat/webapp@87358efe61919cc4a8a48fd4fd024fe885aec33d) by  ([merge request](kchat/webapp!806))

## 2.9.5-rc.2 (2024-06-19)

### Fixed (3 changes)

- [add check to fix js error in conference user denied ws action](kchat/webapp@79eac8d5a170503579fef622eaa1d276b36732aa) by @antonbuksa ([merge request](kchat/webapp!805))
- [fix: custom status overflow](kchat/webapp@80ad28dc76c54871a66cd32368cb925508b0bec8) by @tim.dewinter ([merge request](kchat/webapp!773))
- [fix: error message displayName you](kchat/webapp@123554d51fe8c289538b003cb6d6991ca621ef3c) by  ([merge request](kchat/webapp!804))

## 2.9.5-rc.1 (2024-06-18)

### Added (1 change)

- [implement displaying embedded attachments in post previews](kchat/webapp@6dddc1931deefe0b87f2ca4b6715f8fd886fd3d7) by @antonbuksa ([merge request](kchat/webapp!797))

## 2.9.5-next.4 (2024-06-20)

### Added (1 change)

- [handle case where call no longer exists when answered](kchat/webapp@880c4bf4222c7ae7bf17fd954e087f23144b6359) by @antonbuksa ([merge request](kchat/webapp!808))

### Fixed (2 changes)

- [fix js error in old calls code](kchat/webapp@aa9a016b40e230b0b5bdd51f3c71de0814e3b70f) by @antonbuksa
- [fix call delete reduce not removing key causing exceptions](kchat/webapp@72dfd65bfe75d315511b354f28b625eb25f837d8) by @antonbuksa

## 2.9.5-next.3 (2024-06-20)

### Added (1 change)

- [retry ws channel subscriptions if error occurs](kchat/webapp@14d4a3ddd72001511b92aa3b4321ba670d5e8ede) by @antonbuksa ([merge request](kchat/webapp!810))

## 2.9.5-next.2 (2024-06-19)

### Fixed (4 changes)

- [fix: close actions now close menu](kchat/webapp@87358efe61919cc4a8a48fd4fd024fe885aec33d) by  ([merge request](kchat/webapp!806))
- [add check to fix js error in conference user denied ws action](kchat/webapp@79eac8d5a170503579fef622eaa1d276b36732aa) by @antonbuksa ([merge request](kchat/webapp!805))
- [fix: custom status overflow](kchat/webapp@80ad28dc76c54871a66cd32368cb925508b0bec8) by @tim.dewinter ([merge request](kchat/webapp!773))
- [fix: error message displayName you](kchat/webapp@123554d51fe8c289538b003cb6d6991ca621ef3c) by  ([merge request](kchat/webapp!804))

## 2.9.5-next.1 (2024-06-18)

### Added (1 change)

- [implement displaying embedded attachments in post previews](kchat/webapp@6dddc1931deefe0b87f2ca4b6715f8fd886fd3d7) by @antonbuksa ([merge request](kchat/webapp!797))

## 2.9.4-rc.3 (2024-06-18)

No changes.

## 2.9.4-rc.2 (2024-06-18)

No changes.

## 2.9.4-rc.1 (2024-06-18)

### Fixed (1 change)

- [fix: version_bar.new translation](kchat/webapp@01e7661224548236df1269b3ecd132d33659d301) by @tim.dewinter ([merge request](kchat/webapp!801))

### Chore (1 change)

- [update pdfjs](kchat/webapp@dd77671327b4d0deb4a5846b81fcd8d5010571e0) by @antonbuksa ([merge request](kchat/webapp!799))

## 2.9.4-next.1 (2024-06-18)

### Fixed (1 change)

- [fix: version_bar.new translation](kchat/webapp@01e7661224548236df1269b3ecd132d33659d301) by @tim.dewinter ([merge request](kchat/webapp!801))

### Chore (1 change)

- [update pdfjs](kchat/webapp@dd77671327b4d0deb4a5846b81fcd8d5010571e0) by @antonbuksa ([merge request](kchat/webapp!799))

## 2.9.3-rc.5 (2024-06-11)

### Fixed (1 change)

- [fix link in mas update banner](kchat/webapp@6ec2a9370e8eaed9923b85e75d8f47a111a75f36) by @antonbuksa

## 2.9.3-rc.4 (2024-06-11)

### Fixed (2 changes)

- [Fix: condition with userAgent](kchat/webapp@0dd21b9762833e41bf49fb250daa7641d13c9fbe) by  ([merge request](kchat/webapp!800))
- [Fix: Annoucement banner only for mac app](kchat/webapp@1b09eaab1e2a02912fca8c439a7a9a56d7a00d0d) by  ([merge request](kchat/webapp!800))

## 2.9.3-rc.3 (2024-06-11)

### Fixed (1 change)

- [fix calls not opening in channels on old apps](kchat/webapp@0f85e0ad03ecad0b9392371586e01e17c3d18dc7) by @antonbuksa

## 2.9.3-rc.2 (2024-06-11)

### Fixed (1 change)

- [Fix: Space errors and fix condition](kchat/webapp@ae5f6b9567cde30d07b720a68492466a30c28351) by  ([merge request](kchat/webapp!798))

## 2.9.3-rc.1 (2024-06-10)

### Fixed (2 changes)

- [Fix: Plural for @here](kchat/webapp@9567d688406a604a02b2db15621582c1d8ef483a) by  ([merge request](kchat/webapp!790))
- [Fix: Missing traduction for suggestion list](kchat/webapp@9c8c6e36351414729827acba3c6f179faa081a28) by  ([merge request](kchat/webapp!788))

## 2.9.3-next.3 (2024-06-11)

### Fixed (3 changes)

- [fix link in mas update banner](kchat/webapp@6ec2a9370e8eaed9923b85e75d8f47a111a75f36) by @antonbuksa
- [Fix: condition with userAgent](kchat/webapp@0dd21b9762833e41bf49fb250daa7641d13c9fbe) by  ([merge request](kchat/webapp!800))
- [Fix: Annoucement banner only for mac app](kchat/webapp@1b09eaab1e2a02912fca8c439a7a9a56d7a00d0d) by  ([merge request](kchat/webapp!800))

## 2.9.3-next.2 (2024-06-11)

### Fixed (1 change)

- [fix calls not opening in channels on old apps](kchat/webapp@0f85e0ad03ecad0b9392371586e01e17c3d18dc7) by @antonbuksa

## 2.9.3-next.1 (2024-06-11)

### Fixed (3 changes)

- [Fix: Space errors and fix condition](kchat/webapp@ae5f6b9567cde30d07b720a68492466a30c28351) by  ([merge request](kchat/webapp!798))
- [Fix: Plural for @here](kchat/webapp@9567d688406a604a02b2db15621582c1d8ef483a) by  ([merge request](kchat/webapp!790))
- [Fix: Missing traduction for suggestion list](kchat/webapp@9c8c6e36351414729827acba3c6f179faa081a28) by  ([merge request](kchat/webapp!788))

## 2.9.2-rc.5 (2024-06-07)

No changes.

## 2.9.2-rc.4 (2024-06-07)

No changes.

## 2.9.2-rc.3 (2024-06-07)

No changes.

## 2.9.2-rc.2 (2024-06-07)

### Added (1 change)

- [pass desktop version to create call route](kchat/webapp@15b83c150bc566b5a629ec4b12a75aa0ffb19992) by @antonbuksa

## 2.9.2-rc.1 (2024-06-06)

### Fixed (2 changes)

- [Fix: Remove copy link in audio message](kchat/webapp@ed896fae7ee70068244f6bb8ec36101b46cd6b78) by  ([merge request](kchat/webapp!795))
- [restore pending external invites in rhs members list](kchat/webapp@f051af57d45c2882a2349cd3068480490ac510a1) by @antonbuksa ([merge request](kchat/webapp!793))

### Changed (1 change)

- [reduce spacing in meet button](kchat/webapp@25be7b4256545a43c39f8faacddd670372bf5d31) by @antonbuksa

## 2.9.2-next.2 (2024-06-07)

### Added (1 change)

- [pass desktop version to create call route](kchat/webapp@15b83c150bc566b5a629ec4b12a75aa0ffb19992) by @antonbuksa

## 2.9.2-next.1 (2024-06-06)

### Fixed (2 changes)

- [Fix: Remove copy link in audio message](kchat/webapp@ed896fae7ee70068244f6bb8ec36101b46cd6b78) by  ([merge request](kchat/webapp!795))
- [restore pending external invites in rhs members list](kchat/webapp@f051af57d45c2882a2349cd3068480490ac510a1) by @antonbuksa ([merge request](kchat/webapp!793))

### Changed (1 change)

- [reduce spacing in meet button](kchat/webapp@25be7b4256545a43c39f8faacddd670372bf5d31) by @antonbuksa

## 2.9.1 (2024-06-05)

No changes.

## 2.9.0-rc.15 (2024-06-05)

### Changed (1 change)

- [auto join call for caller in channels](kchat/webapp@0e5d468e9aa9f89fe60dbab95a232e37a01f3762) by @antonbuksa

## 2.9.0-rc.14 (2024-06-05)

### Fixed (1 change)

- [fix call msg display in rhs thread view](kchat/webapp@764ac6f4fd1d48c22b5e670f32ed47bd11fdeb78) by @antonbuksa

## 2.9.0-rc.13 (2024-06-05)

### Changed (1 change)

- [Revert "add 10 sec debounce to desktop theme getter"](kchat/webapp@1aa6bfdbced9d8c7781e0404f599741a363324d8) by @antonbuksa

## 2.9.0-rc.12 (2024-06-05)

### Changed (1 change)

- [add 10 sec debounce to desktop theme getter](kchat/webapp@d418bca4de34a6e23c0903ff40c27e342213a31a) by @antonbuksa

## 2.9.0-rc.11 (2024-06-04)

### Added (1 change)

- [Feat: Audio transcription](kchat/webapp@305e02a71634e099b13c8b73a3d35bffc387b47d) by  ([merge request](kchat/webapp!787))

### Fixed (1 change)

- [fix: sent messages sometimes coming back as drafts](kchat/webapp@561508b28bebe8615607e9b6dcf5ccf4f7415a50) by @tim.dewinter ([merge request](kchat/webapp!772))

## 2.9.0-rc.10 (2024-06-03)

No changes.

## 2.9.0-rc.9 (2024-06-03)

### Fixed (1 change)

- [fix calls web dial modal teardown on conference_deleted ws event](kchat/webapp@13e7418abc2c7b3c4d9ccea0a178442239773ea4) by @antonbuksa

## 2.9.0-rc.8 (2024-05-31)

### Added (3 changes)

- [add kmeet system emoji](kchat/webapp@bfc6abbfc190c62df3a077e03164e2dbd7c3954f) by @antonbuksa ([merge request](kchat/webapp!747))
- [add internal kmeet route](kchat/webapp@8e3d5546f264a7d2c9c96be6965cf17aad55106b) by @antonbuksa ([merge request](kchat/webapp!747))
- [Feature: Kmeet call confirm modal shows up when channel contains more or at least 10 users](kchat/webapp@b894adc5347460220fb20a293272cc699b721d01) by @philippe.karle ([merge request](kchat/webapp!729))

### Fixed (1 change)

- [remove decline call when call missed](kchat/webapp@564549d5249063a067c5724836d3cbc75b53fe4b) by @antonbuksa

## 2.9.0-rc.7 (2024-05-31)

### Fixed (1 change)

- [remove decline call when call missed](kchat/webapp@564549d5249063a067c5724836d3cbc75b53fe4b) by @antonbuksa

## 2.9.0-rc.6 (2024-05-31)

No changes.

## 2.9.0-rc.5 (2024-05-30)

### Fixed (1 change)

- [remove decline call when call missed](kchat/webapp@564549d5249063a067c5724836d3cbc75b53fe4b) by @antonbuksa

## 2.9.0-rc.4 (2024-05-29)

No changes.

## 2.9.0-rc.3 (2024-05-29)

No changes.

## 2.9.0-rc.2 (2024-05-29)

No changes.

## 2.9.0-rc.1 (2024-05-28)

### Added (3 changes)

- [add kmeet system emoji](kchat/webapp@bfc6abbfc190c62df3a077e03164e2dbd7c3954f) by @antonbuksa ([merge request](kchat/webapp!747))
- [add internal kmeet route](kchat/webapp@8e3d5546f264a7d2c9c96be6965cf17aad55106b) by @antonbuksa ([merge request](kchat/webapp!747))
- [Feature: Kmeet call confirm modal shows up when channel contains more or at least 10 users](kchat/webapp@b894adc5347460220fb20a293272cc699b721d01) by @philippe.karle ([merge request](kchat/webapp!729))

## 2.9.0-next.3 (2024-06-05)

### Added (4 changes)

- [Feat: Audio transcription](kchat/webapp@305e02a71634e099b13c8b73a3d35bffc387b47d) by  ([merge request](kchat/webapp!787))
- [add kmeet system emoji](kchat/webapp@bfc6abbfc190c62df3a077e03164e2dbd7c3954f) by @antonbuksa ([merge request](kchat/webapp!747))
- [add internal kmeet route](kchat/webapp@8e3d5546f264a7d2c9c96be6965cf17aad55106b) by @antonbuksa ([merge request](kchat/webapp!747))
- [Feature: Kmeet call confirm modal shows up when channel contains more or at least 10 users](kchat/webapp@b894adc5347460220fb20a293272cc699b721d01) by @philippe.karle ([merge request](kchat/webapp!729))

### Fixed (4 changes)

- [fix call msg display in rhs thread view](kchat/webapp@764ac6f4fd1d48c22b5e670f32ed47bd11fdeb78) by @antonbuksa
- [fix: sent messages sometimes coming back as drafts](kchat/webapp@561508b28bebe8615607e9b6dcf5ccf4f7415a50) by @tim.dewinter ([merge request](kchat/webapp!772))
- [fix calls web dial modal teardown on conference_deleted ws event](kchat/webapp@13e7418abc2c7b3c4d9ccea0a178442239773ea4) by @antonbuksa
- [remove decline call when call missed](kchat/webapp@564549d5249063a067c5724836d3cbc75b53fe4b) by @antonbuksa

### Changed (3 changes)

- [reduce spacing in meet button](kchat/webapp@25be7b4256545a43c39f8faacddd670372bf5d31) by @antonbuksa
- [auto join call for caller in channels](kchat/webapp@0e5d468e9aa9f89fe60dbab95a232e37a01f3762) by @antonbuksa
- [Revert "add 10 sec debounce to desktop theme getter"](kchat/webapp@1aa6bfdbced9d8c7781e0404f599741a363324d8) by @antonbuksa

## 2.9.0-next.2 (2024-06-05)

No changes.

## 2.9.0-next.1 (2024-06-05)

### Added (4 changes)

- [Feat: Audio transcription](kchat/webapp@305e02a71634e099b13c8b73a3d35bffc387b47d) by  ([merge request](kchat/webapp!787))
- [add kmeet system emoji](kchat/webapp@bfc6abbfc190c62df3a077e03164e2dbd7c3954f) by @antonbuksa ([merge request](kchat/webapp!747))
- [add internal kmeet route](kchat/webapp@8e3d5546f264a7d2c9c96be6965cf17aad55106b) by @antonbuksa ([merge request](kchat/webapp!747))
- [Feature: Kmeet call confirm modal shows up when channel contains more or at least 10 users](kchat/webapp@b894adc5347460220fb20a293272cc699b721d01) by @philippe.karle ([merge request](kchat/webapp!729))

### Fixed (4 changes)

- [fix call msg display in rhs thread view](kchat/webapp@764ac6f4fd1d48c22b5e670f32ed47bd11fdeb78) by @antonbuksa
- [fix: sent messages sometimes coming back as drafts](kchat/webapp@561508b28bebe8615607e9b6dcf5ccf4f7415a50) by @tim.dewinter ([merge request](kchat/webapp!772))
- [fix calls web dial modal teardown on conference_deleted ws event](kchat/webapp@13e7418abc2c7b3c4d9ccea0a178442239773ea4) by @antonbuksa
- [remove decline call when call missed](kchat/webapp@564549d5249063a067c5724836d3cbc75b53fe4b) by @antonbuksa

### Changed (3 changes)

- [reduce spacing in meet button](kchat/webapp@25be7b4256545a43c39f8faacddd670372bf5d31) by @antonbuksa
- [auto join call for caller in channels](kchat/webapp@0e5d468e9aa9f89fe60dbab95a232e37a01f3762) by @antonbuksa
- [Revert "add 10 sec debounce to desktop theme getter"](kchat/webapp@1aa6bfdbced9d8c7781e0404f599741a363324d8) by @antonbuksa

## 2.8.2-next.1 (2024-06-04)

### Added (4 changes)

- [Feat: Audio transcription](kchat/webapp@305e02a71634e099b13c8b73a3d35bffc387b47d) by  ([merge request](kchat/webapp!787))
- [add kmeet system emoji](kchat/webapp@bfc6abbfc190c62df3a077e03164e2dbd7c3954f) by @antonbuksa ([merge request](kchat/webapp!747))
- [add internal kmeet route](kchat/webapp@8e3d5546f264a7d2c9c96be6965cf17aad55106b) by @antonbuksa ([merge request](kchat/webapp!747))
- [Feature: Kmeet call confirm modal shows up when channel contains more or at least 10 users](kchat/webapp@b894adc5347460220fb20a293272cc699b721d01) by @philippe.karle ([merge request](kchat/webapp!729))

### Fixed (3 changes)

- [fix: sent messages sometimes coming back as drafts](kchat/webapp@561508b28bebe8615607e9b6dcf5ccf4f7415a50) by @tim.dewinter ([merge request](kchat/webapp!772))
- [fix calls web dial modal teardown on conference_deleted ws event](kchat/webapp@13e7418abc2c7b3c4d9ccea0a178442239773ea4) by @antonbuksa
- [remove decline call when call missed](kchat/webapp@564549d5249063a067c5724836d3cbc75b53fe4b) by @antonbuksa

## 2.8.1-rc.3 (2024-05-23)

No changes.

## 2.8.1-rc.2 (2024-05-22)

No changes.

## 2.8.1-rc.1 (2024-05-16)

No changes.

## 2.8.1-next.5 (2024-06-04)

### Added (3 changes)

- [add kmeet system emoji](kchat/webapp@bfc6abbfc190c62df3a077e03164e2dbd7c3954f) by @antonbuksa ([merge request](kchat/webapp!747))
- [add internal kmeet route](kchat/webapp@8e3d5546f264a7d2c9c96be6965cf17aad55106b) by @antonbuksa ([merge request](kchat/webapp!747))
- [Feature: Kmeet call confirm modal shows up when channel contains more or at least 10 users](kchat/webapp@b894adc5347460220fb20a293272cc699b721d01) by @philippe.karle ([merge request](kchat/webapp!729))

### Fixed (2 changes)

- [fix calls web dial modal teardown on conference_deleted ws event](kchat/webapp@13e7418abc2c7b3c4d9ccea0a178442239773ea4) by @antonbuksa
- [remove decline call when call missed](kchat/webapp@564549d5249063a067c5724836d3cbc75b53fe4b) by @antonbuksa

## 2.8.1-next.4 (2024-06-03)

### Added (3 changes)

- [add kmeet system emoji](kchat/webapp@bfc6abbfc190c62df3a077e03164e2dbd7c3954f) by @antonbuksa ([merge request](kchat/webapp!747))
- [add internal kmeet route](kchat/webapp@8e3d5546f264a7d2c9c96be6965cf17aad55106b) by @antonbuksa ([merge request](kchat/webapp!747))
- [Feature: Kmeet call confirm modal shows up when channel contains more or at least 10 users](kchat/webapp@b894adc5347460220fb20a293272cc699b721d01) by @philippe.karle ([merge request](kchat/webapp!729))

### Fixed (1 change)

- [remove decline call when call missed](kchat/webapp@564549d5249063a067c5724836d3cbc75b53fe4b) by @antonbuksa

## 2.8.1-next.3 (2024-05-31)

### Added (3 changes)

- [add kmeet system emoji](kchat/webapp@bfc6abbfc190c62df3a077e03164e2dbd7c3954f) by @antonbuksa ([merge request](kchat/webapp!747))
- [add internal kmeet route](kchat/webapp@8e3d5546f264a7d2c9c96be6965cf17aad55106b) by @antonbuksa ([merge request](kchat/webapp!747))
- [Feature: Kmeet call confirm modal shows up when channel contains more or at least 10 users](kchat/webapp@b894adc5347460220fb20a293272cc699b721d01) by @philippe.karle ([merge request](kchat/webapp!729))

### Fixed (1 change)

- [remove decline call when call missed](kchat/webapp@564549d5249063a067c5724836d3cbc75b53fe4b) by @antonbuksa

## 2.8.1-next.2 (2024-05-22)

No changes.

## 2.8.1-next.1 (2024-05-16)

No changes.

## 2.8.0-rc.14 (2024-05-15)

### Fixed (1 change)

- [fix missing posttype in last_users component](kchat/webapp@b0f6250b91f1ebafc1fab97381b96bc248dedd8c) by @antonbuksa

## 2.8.0-rc.13 (2024-05-15)

### Fixed (1 change)

- [restore import.meta.url in wasm module import](kchat/webapp@70584f03e3d62fa017268a44858acb0ad0122d51) by @antonbuksa

## 2.8.0-rc.12 (2024-05-14)

### Fixed (2 changes)

- [fix: added missing getChannelsMemberCount action](kchat/webapp@3b3fd8f9e8771b77779cf4fc608518b784b52ccd) by @tim.dewinter ([merge request](kchat/webapp!780))
- [fix: suggestion list emoji overflow](kchat/webapp@70f6d94489708f96a84a228b1589a88a6c001820) by @tim.dewinter ([merge request](kchat/webapp!777))

## 2.8.0-rc.11 (2024-05-13)

No changes.

## 2.8.0-rc.10 (2024-05-13)

### Added (12 changes)

- [Fix traduction for add channel member component](kchat/webapp@f52d7a718bb7cafaa3b58d7bf912b57cec10eaca) by  ([merge request](kchat/webapp!730))
- [Fix unit test class for PostAddChannelMember component](kchat/webapp@95b30458962bca59ca283bdf3ea96ff2e2a0a333) by  ([merge request](kchat/webapp!730))
- [Fix unit test for PostAddChannelMember component](kchat/webapp@2054136949bc37a5de06ef8d6588362eb6a2a086) by  ([merge request](kchat/webapp!730))
- [Fix original post_id for notify message](kchat/webapp@56ac6f75e5c08db5bc9d981ae58e9a400fae42b6) by  ([merge request](kchat/webapp!730))
- [Fix traduction for notify message](kchat/webapp@821d00206d3ba1cc69bf91b2620e14957f46fee8) by  ([merge request](kchat/webapp!730))
- [Add notification when pinging user in a channel fix eslint error 2](kchat/webapp@ecc16fa3fd947faa33b8ebd8a5d0abb27ab5ed6b) by  ([merge request](kchat/webapp!730))
- [Add notification when pinging user in a channel fix eslint error 2](kchat/webapp@e02958d457c609396347108cb4efc86da2a8c7c6) by  ([merge request](kchat/webapp!730))
- [Add notification when pinging user in a channel fix eslint error](kchat/webapp@397c617ea77fed6556b64152dd6c6c55e778078b) by  ([merge request](kchat/webapp!730))
- [Add notification when pinging user in a channel fix](kchat/webapp@8c3102923abe336def1f236a60b935a34c77adce) by  ([merge request](kchat/webapp!730))
- [Add traduction for notify message](kchat/webapp@3eb2107898bc784c8c843ead20b236d925c038b3) by  ([merge request](kchat/webapp!730))
- [Add notification when pinging user in a channel](kchat/webapp@8651b62139a3715af9fe7746faa0b40ed4674238) by  ([merge request](kchat/webapp!730))
- [Ajout d'une notification quand on ajoute un User dans un channel](kchat/webapp@61210a27030c1eca4924f25c6ed56fd3a19a2abd) by  ([merge request](kchat/webapp!730))

## 2.8.0-rc.9 (2024-05-13)

### Removed (2 changes)

- [MM-57885: Do not mark channel as read on tab unload (#26811)](kchat/webapp@a0fd5ac7f69552cc9fea86f14ec55fb4f5a8e8d8) by  ([merge request](kchat/webapp!779))
- [remove webpack pwa manifest plugin](kchat/webapp@90ce368df7c429e0dcbe8621a6ca5978577ab13d) by @antonbuksa ([merge request](kchat/webapp!778))

## 2.8.0-rc.8 (2024-05-08)

### Fixed (3 changes)

- [fix: image save to kdrive icon style](kchat/webapp@fbcbbb973ca075a9e748eb8fe15f41b68afae733) by @tim.dewinter ([merge request](kchat/webapp!774))
- [fix: shortcut colors for desktop](kchat/webapp@b94675e99fab926034992c685a4b9b67fe3bf4a7) by @tim.dewinter ([merge request](kchat/webapp!776))
- [fix onboarding steps hook and anchors](kchat/webapp@8385fa0500fa057f18ed20745bdccb142ff3c49e) by @antonbuksa ([merge request](kchat/webapp!775))

### Chore (1 change)

- [light cleanup of trial and purchase components causing wpack errors](kchat/webapp@3a022cdef990a957653480252e9ec1a685913946) by @antonbuksa ([merge request](kchat/webapp!775))

## 2.8.0-rc.7 (2024-05-08)

### Fixed (1 change)

- [fix: multi-select input style](kchat/webapp@f4109119fa01b9c45b99fbe79b88bf64d1371a87) by @tim.dewinter ([merge request](kchat/webapp!771))

## 2.8.0-rc.6 (2024-05-06)

### Changed (1 change)

- [restore message history limiter in search_results](kchat/webapp@373d18c49fa0999b08924ad0d2fb6c8f352250df) by @antonbuksa

## 2.8.0-rc.5 (2024-05-06)

### Changed (1 change)

- [Revert front-end changes for #25715 (#26553)](kchat/webapp@92cf5b587f0784a00a7f62eb37a0c51477d3c00a) by  ([merge request](kchat/webapp!769))

### Removed (1 change)

- [do not send new mattermost presence events](kchat/webapp@4e35290f56aeb0450ec217d2f91fcbff145d4c03) by @antonbuksa

## 2.8.0-rc.4 (2024-05-06)

### Changed (1 change)

- [update message_html_to_component module for emoji preview in posts](kchat/webapp@3c286404d0786c66de7519c7e5dd9cd9062ea05f) by @antonbuksa ([merge request](kchat/webapp!768))

## 2.8.0-rc.3 (2024-05-03)

### Fixed (2 changes)

- [fix: disabled search bar outline](kchat/webapp@9139ebbdd4aefa8735f4ea44bad9e1708b39a7fb) by @tim.dewinter ([merge request](kchat/webapp!765))
- [fix: message priority footer font-family](kchat/webapp@34c625a4c09d66a5237bdb029c696ecf80bab06b) by @tim.dewinter ([merge request](kchat/webapp!764))

## 2.8.0-rc.2 (2024-05-03)

### Fixed (3 changes)

- [fix: edit channel header modal button dark mode](kchat/webapp@619248a849a3eac7ed0ca71b36f77ec21cf442e6) by @tim.dewinter ([merge request](kchat/webapp!763))
- [fix view user groups heading align](kchat/webapp@37ad93d33ffbf9728449336d3a417cfdb2536968) by @antonbuksa
- [fix: channel info close button in dark mode](kchat/webapp@c0a0836fc0ea73883c0b3f6cac788c1e5e65bd55) by @tim.dewinter ([merge request](kchat/webapp!762))

### Removed (1 change)

- [hide learn about search url in search helper](kchat/webapp@4fe73fec7a64ecf66800f1a905566fbf8af37f38) by @antonbuksa

## 2.8.0-rc.1 (2024-05-03)

No changes.

## 2.8.0-next.4 (2024-05-15)

### Fixed (1 change)

- [fix missing posttype in last_users component](kchat/webapp@b0f6250b91f1ebafc1fab97381b96bc248dedd8c) by @antonbuksa

## 2.8.0-next.3 (2024-05-15)

### Fixed (1 change)

- [restore import.meta.url in wasm module import](kchat/webapp@70584f03e3d62fa017268a44858acb0ad0122d51) by @antonbuksa

## 2.8.0-next.2 (2024-05-14)

### Fixed (2 changes)

- [fix: added missing getChannelsMemberCount action](kchat/webapp@3b3fd8f9e8771b77779cf4fc608518b784b52ccd) by @tim.dewinter ([merge request](kchat/webapp!780))
- [fix: suggestion list emoji overflow](kchat/webapp@70f6d94489708f96a84a228b1589a88a6c001820) by @tim.dewinter ([merge request](kchat/webapp!777))

## 2.8.0-next.1 (2024-05-13)

### Added (12 changes)

- [Fix traduction for add channel member component](kchat/webapp@f52d7a718bb7cafaa3b58d7bf912b57cec10eaca) by  ([merge request](kchat/webapp!730))
- [Fix unit test class for PostAddChannelMember component](kchat/webapp@95b30458962bca59ca283bdf3ea96ff2e2a0a333) by  ([merge request](kchat/webapp!730))
- [Fix unit test for PostAddChannelMember component](kchat/webapp@2054136949bc37a5de06ef8d6588362eb6a2a086) by  ([merge request](kchat/webapp!730))
- [Fix original post_id for notify message](kchat/webapp@56ac6f75e5c08db5bc9d981ae58e9a400fae42b6) by  ([merge request](kchat/webapp!730))
- [Fix traduction for notify message](kchat/webapp@821d00206d3ba1cc69bf91b2620e14957f46fee8) by  ([merge request](kchat/webapp!730))
- [Add notification when pinging user in a channel fix eslint error 2](kchat/webapp@ecc16fa3fd947faa33b8ebd8a5d0abb27ab5ed6b) by  ([merge request](kchat/webapp!730))
- [Add notification when pinging user in a channel fix eslint error 2](kchat/webapp@e02958d457c609396347108cb4efc86da2a8c7c6) by  ([merge request](kchat/webapp!730))
- [Add notification when pinging user in a channel fix eslint error](kchat/webapp@397c617ea77fed6556b64152dd6c6c55e778078b) by  ([merge request](kchat/webapp!730))
- [Add notification when pinging user in a channel fix](kchat/webapp@8c3102923abe336def1f236a60b935a34c77adce) by  ([merge request](kchat/webapp!730))
- [Add traduction for notify message](kchat/webapp@3eb2107898bc784c8c843ead20b236d925c038b3) by  ([merge request](kchat/webapp!730))
- [Add notification when pinging user in a channel](kchat/webapp@8651b62139a3715af9fe7746faa0b40ed4674238) by  ([merge request](kchat/webapp!730))
- [Ajout d'une notification quand on ajoute un User dans un channel](kchat/webapp@61210a27030c1eca4924f25c6ed56fd3a19a2abd) by  ([merge request](kchat/webapp!730))

### Removed (2 changes)

- [MM-57885: Do not mark channel as read on tab unload (#26811)](kchat/webapp@a0fd5ac7f69552cc9fea86f14ec55fb4f5a8e8d8) by  ([merge request](kchat/webapp!779))
- [remove webpack pwa manifest plugin](kchat/webapp@90ce368df7c429e0dcbe8621a6ca5978577ab13d) by @antonbuksa ([merge request](kchat/webapp!778))

## 2.7.2-next.2 (2024-05-08)

### Fixed (3 changes)

- [fix: image save to kdrive icon style](kchat/webapp@fbcbbb973ca075a9e748eb8fe15f41b68afae733) by @tim.dewinter ([merge request](kchat/webapp!774))
- [fix: shortcut colors for desktop](kchat/webapp@b94675e99fab926034992c685a4b9b67fe3bf4a7) by @tim.dewinter ([merge request](kchat/webapp!776))
- [fix onboarding steps hook and anchors](kchat/webapp@8385fa0500fa057f18ed20745bdccb142ff3c49e) by @antonbuksa ([merge request](kchat/webapp!775))

### Chore (1 change)

- [light cleanup of trial and purchase components causing wpack errors](kchat/webapp@3a022cdef990a957653480252e9ec1a685913946) by @antonbuksa ([merge request](kchat/webapp!775))

## 2.7.2-next.1 (2024-05-08)

### Fixed (1 change)

- [fix: multi-select input style](kchat/webapp@f4109119fa01b9c45b99fbe79b88bf64d1371a87) by @tim.dewinter ([merge request](kchat/webapp!771))

## 2.7.1-next.3 (2024-05-06)

### Changed (1 change)

- [restore message history limiter in search_results](kchat/webapp@373d18c49fa0999b08924ad0d2fb6c8f352250df) by @antonbuksa

## 2.7.1-next.2 (2024-05-06)

### Changed (1 change)

- [Revert front-end changes for #25715 (#26553)](kchat/webapp@92cf5b587f0784a00a7f62eb37a0c51477d3c00a) by  ([merge request](kchat/webapp!769))

### Removed (1 change)

- [do not send new mattermost presence events](kchat/webapp@4e35290f56aeb0450ec217d2f91fcbff145d4c03) by @antonbuksa

## 2.7.1-next.1 (2024-05-06)

### Fixed (5 changes)

- [fix: disabled search bar outline](kchat/webapp@9139ebbdd4aefa8735f4ea44bad9e1708b39a7fb) by @tim.dewinter ([merge request](kchat/webapp!765))
- [fix: message priority footer font-family](kchat/webapp@34c625a4c09d66a5237bdb029c696ecf80bab06b) by @tim.dewinter ([merge request](kchat/webapp!764))
- [fix: edit channel header modal button dark mode](kchat/webapp@619248a849a3eac7ed0ca71b36f77ec21cf442e6) by @tim.dewinter ([merge request](kchat/webapp!763))
- [fix view user groups heading align](kchat/webapp@37ad93d33ffbf9728449336d3a417cfdb2536968) by @antonbuksa
- [fix: channel info close button in dark mode](kchat/webapp@c0a0836fc0ea73883c0b3f6cac788c1e5e65bd55) by @tim.dewinter ([merge request](kchat/webapp!762))

### Changed (1 change)

- [update message_html_to_component module for emoji preview in posts](kchat/webapp@3c286404d0786c66de7519c7e5dd9cd9062ea05f) by @antonbuksa ([merge request](kchat/webapp!768))

### Removed (1 change)

- [hide learn about search url in search helper](kchat/webapp@4fe73fec7a64ecf66800f1a905566fbf8af37f38) by @antonbuksa

## 2.7.0-rc.24 (2024-05-01)

### Changed (1 change)

- [update post options component](kchat/webapp@2b4f05a0a6b2f01012f248762b1fd4122741374e) by @antonbuksa

## 2.7.0-rc.23 (2024-05-01)

### Fixed (1 change)

- [fix timestamps not supposed to be displayed as relative](kchat/webapp@91021e1728f612d9d888196b4b5b29463fe7f09e) by @antonbuksa

## 2.7.0-rc.22 (2024-05-01)

### Fixed (1 change)

- [fix pl logic and tests for dm/gm with previews](kchat/webapp@a53b7d8ba0ab2d1abd9875b41d5a4c1aa0dae1f4) by @antonbuksa

## 2.7.0-rc.21 (2024-05-01)

### Fixed (1 change)

- [fix permalink channel previews](kchat/webapp@edc52c331e1f675c96b500246b17642acfa23fe3) by @antonbuksa

## 2.7.0-rc.20 (2024-04-30)

### Changed (1 change)

- [disable consecutive messages in threads](kchat/webapp@31558dcf5a440c2b15b1400c7c139da3861a3539) by @antonbuksa

## 2.7.0-rc.19 (2024-04-30)

### Changed (1 change)

- [css update posts](kchat/webapp@a3e5cd68656028ebf9fcd772c8ed1ffc0141950e) by @antonbuksa

## 2.7.0-rc.18 (2024-04-30)

### Fixed (2 changes)

- [fix content gap in threads](kchat/webapp@7e82d133920796a8fd7809b30f7e23ef452a9433) by @antonbuksa
- [fix schedule message dialog style](kchat/webapp@4636ea8e969009c41285690c25fe07089f205954) by @antonbuksa

## 2.7.0-rc.17 (2024-04-30)

### Fixed (3 changes)

- [Fix: weird looking button on settings modal](kchat/webapp@26bc008067d6175e753c7aeaa9a8ab63db515d16) by @philippe.karle ([merge request](kchat/webapp!759))
- [fix: thread list mark all as read button tooltip re-appearing](kchat/webapp@a276a48bb3c3a067ff22d0f9977b1d0db0045b68) by @tim.dewinter ([merge request](kchat/webapp!758))
- [fix: empty ephemeral messages](kchat/webapp@a9089b6b09584d30abebf1b79ac48341f534941e) by @tim.dewinter ([merge request](kchat/webapp!756))

### Removed (1 change)

- [Team name removed from channel search panel !636](kchat/webapp@85974c0d409f650d449c9f424432c56d480fea6a) by @antonbuksa

## 2.7.0-rc.16 (2024-04-26)

### Fixed (3 changes)

- [fix: thread icon collapse display](kchat/webapp@7bb4476dac4a08366a7f1a75d04801a7ee4d58ae) by @tim.dewinter ([merge request](kchat/webapp!754))
- [fix: inconsistent custom gif file size translation](kchat/webapp@88ae493c446ce34433fff387830f121c6cec3753) by @tim.dewinter ([merge request](kchat/webapp!753))
- [fix: bug tracker background-color if component is hidden](kchat/webapp@804a32dbf3e7a3ed4acc1e28dbcf56990a5ad060) by @tim.dewinter ([merge request](kchat/webapp!752))

## 2.7.0-rc.15 (2024-04-25)

### Added (1 change)

- [feat: allowed collapsing gifs](kchat/webapp@49ab5e2c476870043f62bad52cf7172d0c07ddaf) by @tim.dewinter ([merge request](kchat/webapp!750))

### Fixed (2 changes)

- [Fix: Numbered table list content overflowing parent element](kchat/webapp@4a40462d9850ce8dc1fd67e9c90a2e4d58fe3467) by @philippe.karle ([merge request](kchat/webapp!732))
- [fix: compact post header alignment](kchat/webapp@b7452a09bb66b7b53453b9461e540dac3582bf01) by @tim.dewinter ([merge request](kchat/webapp!745))

## 2.7.0-rc.14 (2024-04-25)

### Fixed (3 changes)

- [fix: disabled enable/disable join leave messages preference](kchat/webapp@ae7b72b5178b44df7f6c5c12b65ee87bfaaa19a1) by @tim.dewinter ([merge request](kchat/webapp!748))
- [fix: channel display name appearing in saved thread](kchat/webapp@49faf78645a3cfa085d5264b9b4216ad375b8a84) by @tim.dewinter ([merge request](kchat/webapp!746))
- [fix: re-added user popover profile copy button](kchat/webapp@387743764b6a8ef4da2ed281b0b5f766d8b0e36e) by @tim.dewinter ([merge request](kchat/webapp!744))

## 2.7.0-rc.13 (2024-04-23)

### Fixed (1 change)

- [Fix: Locale post message for servers sidebar](kchat/webapp@5c26dc09aeb0a09825510f44b0c9f621fe9c1035) by @philippe.karle ([merge request](kchat/webapp!741))

## 2.7.0-rc.12 (2024-04-23)

### Added (1 change)

- [Feature: listen to settings navigation events](kchat/webapp@9c788e419324fc20b07e1efdf3eda2b0e167f6e8) by @philippe.karle

### Fixed (11 changes)

- [Reloading guest members on current channel on user roles changes](kchat/webapp@5867269fb722f957cd509790f287244514ff1fa7) by @philippe.karle ([merge request](kchat/webapp!733))
- [Fix: loading all users profiles available](kchat/webapp@34734451b771b90c6af6007c7410297528f4804d) by @philippe.karle ([merge request](kchat/webapp!739))
- [fix: Replaced worker-src placeholder for sentry CSP](kchat/webapp@3c2bee906b1383951914b3d60f8bac2d57d2b7e2) by  ([merge request](kchat/webapp!738))
- [Fix: red banner on quick channel switch](kchat/webapp@ae3502acd0d3a18a0418b849471f57438f3d2468) by @philippe.karle ([merge request](kchat/webapp!736))
- [Fix: dark theme user modal design broken](kchat/webapp@be3db93cf2cc2033bd8fdd0726b524fa292352b5) by @philippe.karle ([merge request](kchat/webapp!735))
- [fix audio recording module](kchat/webapp@4744c26f7b0531d21a4ae4cb5921eadf23e1efc7) by @antonbuksa
- [fix login loading template](kchat/webapp@a86d97b9ce8622984c6e21142a7d9c1edf517da8) by @antonbuksa
- [fix buttons status reset dialog](kchat/webapp@b990800e045a50277f5e6f432296acc820cd66f7) by @antonbuksa
- [fix margin in emoji autocomplete](kchat/webapp@4eb40d4037da844a1b3328414a8491ad8b425213) by @antonbuksa
- [fix profile action](kchat/webapp@8f7fc1c05b95c05adc139cbf70cc7a2672ac71e2) by @antonbuksa
- [restore mas migration banner](kchat/webapp@7c245a78759263070f036cc17e576c5c7537828f) by @antonbuksa

### Changed (2 changes)

- [hard update notification actions](kchat/webapp@e8be15119678b41f2ee0121bbf94bc236fe46b01) by @antonbuksa
- [Fix: switch-server event triggering on webapp](kchat/webapp@edffba3e44fe953213a5ad2dbc7c858a8f253700) by @philippe.karle ([merge request](kchat/webapp!731))

### Chore (1 change)

- [Merge remote-tracking branch 'mattermost/master' into MM-9.3](kchat/webapp@f0a2e5ab2c86c682486a483023c2041e23c6bdab) by @antonbuksa ([merge request](kchat/webapp!672))

## 2.7.0-rc.11 (2024-04-22)

No changes.

## 2.7.0-rc.10 (2024-04-22)

### Added (1 change)

- [Feature: listen to settings navigation events](kchat/webapp@9c788e419324fc20b07e1efdf3eda2b0e167f6e8) by @philippe.karle

## 2.7.0-rc.9 (2024-04-22)

No changes.

## 2.7.0-rc.8 (2024-04-22)

### Fixed (2 changes)

- [Fix: red banner on quick channel switch](kchat/webapp@ae3502acd0d3a18a0418b849471f57438f3d2468) by @philippe.karle ([merge request](kchat/webapp!736))
- [Fix: dark theme user modal design broken](kchat/webapp@be3db93cf2cc2033bd8fdd0726b524fa292352b5) by @philippe.karle ([merge request](kchat/webapp!735))

## 2.7.0-rc.7 (2024-04-22)

### Fixed (1 change)

- [fix audio recording module](kchat/webapp@4744c26f7b0531d21a4ae4cb5921eadf23e1efc7) by @antonbuksa

## 2.7.0-rc.6 (2024-04-22)

### Fixed (4 changes)

- [fix audio recording module](kchat/webapp@4744c26f7b0531d21a4ae4cb5921eadf23e1efc7) by @antonbuksa
- [fix login loading template](kchat/webapp@a86d97b9ce8622984c6e21142a7d9c1edf517da8) by @antonbuksa
- [fix buttons status reset dialog](kchat/webapp@b990800e045a50277f5e6f432296acc820cd66f7) by @antonbuksa
- [fix margin in emoji autocomplete](kchat/webapp@4eb40d4037da844a1b3328414a8491ad8b425213) by @antonbuksa

### Changed (1 change)

- [hard update notification actions](kchat/webapp@e8be15119678b41f2ee0121bbf94bc236fe46b01) by @antonbuksa

## 2.7.0-rc.5 (2024-04-19)

### Fixed (1 change)

- [fix profile action](kchat/webapp@8f7fc1c05b95c05adc139cbf70cc7a2672ac71e2) by @antonbuksa

## 2.7.0-rc.4 (2024-04-19)

### Fixed (1 change)

- [restore mas migration banner](kchat/webapp@7c245a78759263070f036cc17e576c5c7537828f) by @antonbuksa

## 2.7.0-rc.3 (2024-04-19)

### Fixed (1 change)

- [restore mas migration banner](kchat/webapp@7c245a78759263070f036cc17e576c5c7537828f) by @antonbuksa

## 2.7.0-rc.2 (2024-04-19)

No changes.

## 2.7.0-rc.1 (2024-04-19)

### Changed (1 change)

- [Fix: switch-server event triggering on webapp](kchat/webapp@edffba3e44fe953213a5ad2dbc7c858a8f253700) by @philippe.karle ([merge request](kchat/webapp!731))

### Chore (1 change)

- [Merge remote-tracking branch 'mattermost/master' into MM-9.3](kchat/webapp@f0a2e5ab2c86c682486a483023c2041e23c6bdab) by @antonbuksa ([merge request](kchat/webapp!672))

## 2.7.0-next.16 (2024-05-03)

### Fixed (2 changes)

- [fix: disabled search bar outline](kchat/webapp@9139ebbdd4aefa8735f4ea44bad9e1708b39a7fb) by @tim.dewinter ([merge request](kchat/webapp!765))
- [fix: message priority footer font-family](kchat/webapp@34c625a4c09d66a5237bdb029c696ecf80bab06b) by @tim.dewinter ([merge request](kchat/webapp!764))

## 2.7.0-next.15 (2024-05-03)

### Fixed (3 changes)

- [fix: edit channel header modal button dark mode](kchat/webapp@619248a849a3eac7ed0ca71b36f77ec21cf442e6) by @tim.dewinter ([merge request](kchat/webapp!763))
- [fix view user groups heading align](kchat/webapp@37ad93d33ffbf9728449336d3a417cfdb2536968) by @antonbuksa
- [fix: channel info close button in dark mode](kchat/webapp@c0a0836fc0ea73883c0b3f6cac788c1e5e65bd55) by @tim.dewinter ([merge request](kchat/webapp!762))

### Removed (1 change)

- [hide learn about search url in search helper](kchat/webapp@4fe73fec7a64ecf66800f1a905566fbf8af37f38) by @antonbuksa

## 2.7.0-next.14 (2024-05-01)

### Fixed (1 change)

- [fix timestamps not supposed to be displayed as relative](kchat/webapp@91021e1728f612d9d888196b4b5b29463fe7f09e) by @antonbuksa

### Changed (1 change)

- [update post options component](kchat/webapp@2b4f05a0a6b2f01012f248762b1fd4122741374e) by @antonbuksa

## 2.7.0-next.13 (2024-05-01)

### Fixed (1 change)

- [fix pl logic and tests for dm/gm with previews](kchat/webapp@a53b7d8ba0ab2d1abd9875b41d5a4c1aa0dae1f4) by @antonbuksa

## 2.7.0-next.12 (2024-05-01)

### Fixed (1 change)

- [fix permalink channel previews](kchat/webapp@edc52c331e1f675c96b500246b17642acfa23fe3) by @antonbuksa

## 2.7.0-next.11 (2024-04-30)

### Fixed (2 changes)

- [fix content gap in threads](kchat/webapp@7e82d133920796a8fd7809b30f7e23ef452a9433) by @antonbuksa
- [fix schedule message dialog style](kchat/webapp@4636ea8e969009c41285690c25fe07089f205954) by @antonbuksa

### Changed (2 changes)

- [disable consecutive messages in threads](kchat/webapp@31558dcf5a440c2b15b1400c7c139da3861a3539) by @antonbuksa
- [css update posts](kchat/webapp@a3e5cd68656028ebf9fcd772c8ed1ffc0141950e) by @antonbuksa

## 2.7.0-next.10 (2024-04-30)

### Fixed (6 changes)

- [Fix: weird looking button on settings modal](kchat/webapp@26bc008067d6175e753c7aeaa9a8ab63db515d16) by @philippe.karle ([merge request](kchat/webapp!759))
- [fix: thread list mark all as read button tooltip re-appearing](kchat/webapp@a276a48bb3c3a067ff22d0f9977b1d0db0045b68) by @tim.dewinter ([merge request](kchat/webapp!758))
- [fix: empty ephemeral messages](kchat/webapp@a9089b6b09584d30abebf1b79ac48341f534941e) by @tim.dewinter ([merge request](kchat/webapp!756))
- [fix: thread icon collapse display](kchat/webapp@7bb4476dac4a08366a7f1a75d04801a7ee4d58ae) by @tim.dewinter ([merge request](kchat/webapp!754))
- [fix: inconsistent custom gif file size translation](kchat/webapp@88ae493c446ce34433fff387830f121c6cec3753) by @tim.dewinter ([merge request](kchat/webapp!753))
- [fix: bug tracker background-color if component is hidden](kchat/webapp@804a32dbf3e7a3ed4acc1e28dbcf56990a5ad060) by @tim.dewinter ([merge request](kchat/webapp!752))

### Removed (1 change)

- [Team name removed from channel search panel !636](kchat/webapp@85974c0d409f650d449c9f424432c56d480fea6a) by @antonbuksa

## 2.7.0-next.9 (2024-04-25)

### Added (1 change)

- [feat: allowed collapsing gifs](kchat/webapp@49ab5e2c476870043f62bad52cf7172d0c07ddaf) by @tim.dewinter ([merge request](kchat/webapp!750))

### Fixed (5 changes)

- [Fix: Numbered table list content overflowing parent element](kchat/webapp@4a40462d9850ce8dc1fd67e9c90a2e4d58fe3467) by @philippe.karle ([merge request](kchat/webapp!732))
- [fix: compact post header alignment](kchat/webapp@b7452a09bb66b7b53453b9461e540dac3582bf01) by @tim.dewinter ([merge request](kchat/webapp!745))
- [fix: disabled enable/disable join leave messages preference](kchat/webapp@ae7b72b5178b44df7f6c5c12b65ee87bfaaa19a1) by @tim.dewinter ([merge request](kchat/webapp!748))
- [fix: channel display name appearing in saved thread](kchat/webapp@49faf78645a3cfa085d5264b9b4216ad375b8a84) by @tim.dewinter ([merge request](kchat/webapp!746))
- [fix: re-added user popover profile copy button](kchat/webapp@387743764b6a8ef4da2ed281b0b5f766d8b0e36e) by @tim.dewinter ([merge request](kchat/webapp!744))

## 2.7.0-next.8 (2024-04-23)

### Fixed (1 change)

- [Fix: Locale post message for servers sidebar](kchat/webapp@5c26dc09aeb0a09825510f44b0c9f621fe9c1035) by @philippe.karle ([merge request](kchat/webapp!741))

## 2.7.0-next.7 (2024-04-23)

### Fixed (3 changes)

- [Reloading guest members on current channel on user roles changes](kchat/webapp@5867269fb722f957cd509790f287244514ff1fa7) by @philippe.karle ([merge request](kchat/webapp!733))
- [Fix: loading all users profiles available](kchat/webapp@34734451b771b90c6af6007c7410297528f4804d) by @philippe.karle ([merge request](kchat/webapp!739))
- [fix: Replaced worker-src placeholder for sentry CSP](kchat/webapp@3c2bee906b1383951914b3d60f8bac2d57d2b7e2) by  ([merge request](kchat/webapp!738))

## 2.7.0-next.6 (2024-04-22)

### Added (1 change)

- [Feature: listen to settings navigation events](kchat/webapp@9c788e419324fc20b07e1efdf3eda2b0e167f6e8) by @philippe.karle

## 2.7.0-next.5 (2024-04-22)

No changes.

## 2.7.0-next.4 (2024-04-22)

### Fixed (2 changes)

- [Fix: red banner on quick channel switch](kchat/webapp@ae3502acd0d3a18a0418b849471f57438f3d2468) by @philippe.karle ([merge request](kchat/webapp!736))
- [Fix: dark theme user modal design broken](kchat/webapp@be3db93cf2cc2033bd8fdd0726b524fa292352b5) by @philippe.karle ([merge request](kchat/webapp!735))

## 2.7.0-next.3 (2024-04-22)

### Fixed (4 changes)

- [fix audio recording module](kchat/webapp@4744c26f7b0531d21a4ae4cb5921eadf23e1efc7) by @antonbuksa
- [fix login loading template](kchat/webapp@a86d97b9ce8622984c6e21142a7d9c1edf517da8) by @antonbuksa
- [fix buttons status reset dialog](kchat/webapp@b990800e045a50277f5e6f432296acc820cd66f7) by @antonbuksa
- [fix margin in emoji autocomplete](kchat/webapp@4eb40d4037da844a1b3328414a8491ad8b425213) by @antonbuksa

### Changed (1 change)

- [hard update notification actions](kchat/webapp@e8be15119678b41f2ee0121bbf94bc236fe46b01) by @antonbuksa

## 2.7.0-next.2 (2024-04-19)

### Fixed (2 changes)

- [fix profile action](kchat/webapp@8f7fc1c05b95c05adc139cbf70cc7a2672ac71e2) by @antonbuksa
- [restore mas migration banner](kchat/webapp@7c245a78759263070f036cc17e576c5c7537828f) by @antonbuksa

## 2.7.0-next.1 (2024-04-19)

### Fixed (1 change)

- [restore mas migration banner](kchat/webapp@7c245a78759263070f036cc17e576c5c7537828f) by @antonbuksa

### Changed (1 change)

- [Fix: switch-server event triggering on webapp](kchat/webapp@edffba3e44fe953213a5ad2dbc7c858a8f253700) by @philippe.karle ([merge request](kchat/webapp!731))

### Chore (1 change)

- [Merge remote-tracking branch 'mattermost/master' into MM-9.3](kchat/webapp@f0a2e5ab2c86c682486a483023c2041e23c6bdab) by @antonbuksa ([merge request](kchat/webapp!672))

## 2.6.3-rc.6 (2024-04-16)

### Fixed (3 changes)

- [fix ksuite bridge dnd register](kchat/webapp@00b8726876e5b4ce2b8863b603965007a1709674) by @antonbuksa
- [Fix: User profile popover going off screen when name length is too long](kchat/webapp@0cee0ea41565a6b632de5c43d7c9ff55d11ffe7c) by @philippe.karle ([merge request](kchat/webapp!713))
- [Fix: Change SuggestionBox placement based on textbox with rather than viewport width](kchat/webapp@502fb9399fe07e8ce9629e579993b32818b1e2e1) by @philippe.karle ([merge request](kchat/webapp!692))

## 2.6.3-rc.5 (2024-04-15)

### Added (1 change)

- [log count of fetched profiles when fetching statuses](kchat/webapp@54b11e799d6432abdea0a0e22f439bdf001caf96) by @antonbuksa

### Fixed (2 changes)

- [Fix: option + esc shortcut error due to missing import](kchat/webapp@03e5972dd86b5f9dd120e474cf83c075c4a3a332) by @philippe.karle ([merge request](kchat/webapp!728))
- [Fix: close modal after joining channel](kchat/webapp@4eaa2304a43a41c7c5d0ec617de0ccb832380350) by @philippe.karle ([merge request](kchat/webapp!726))

## 2.6.3-rc.4 (2024-04-12)

### Fixed (2 changes)

- [Fix: themes buttons not displaying properly on small devices](kchat/webapp@76681f69098cc7f549e947989b6a2eba5fb0ce9a) by @philippe.karle ([merge request](kchat/webapp!725))
- [Fix: Insights hide deleted users](kchat/webapp@7a68d7cbd284e8ad11ae263a40cdb6df8d2f2346) by @philippe.karle ([merge request](kchat/webapp!659))

## 2.6.3-rc.3 (2024-04-12)

### Fixed (1 change)

- [Fix: Servers sidebar events runtime error due to missing value](kchat/webapp@e42e1504f955168a3af4994f395915ff51b2eb5d) by @philippe.karle ([merge request](kchat/webapp!724))

## 2.6.3-rc.2 (2024-04-12)

### Fixed (2 changes)

- [Fix: Remove unwanted paramterers from file extension coming from giphy](kchat/webapp@57c600a361278e213fa3fc4b1dbf0eb727ee70fa) by @philippe.karle ([merge request](kchat/webapp!714))
- [Fix threads attachement displaying undefined](kchat/webapp@92fd0ab8d5bbb494e72441906e788dae47a55d18) by @philippe.karle ([merge request](kchat/webapp!662))

## 2.6.3-rc.1 (2024-04-12)

### Fixed (4 changes)

- [Fix: group channels members not loaded when category is collapsed](kchat/webapp@9e934c2c28b695d01eda422d7d3034acb8860fb5) by @philippe.karle ([merge request](kchat/webapp!693))
- [Fix: Remove unwanted paramterers from file extension coming from giphy](kchat/webapp@57c600a361278e213fa3fc4b1dbf0eb727ee70fa) by @philippe.karle ([merge request](kchat/webapp!714))
- [Fix: responsive sidebar link item overflowing](kchat/webapp@7029c421a0f0b5fdfc6defd3e83db7cff78b5485) by @philippe.karle ([merge request](kchat/webapp!712))
- [Fix: load deleted posts on channel switch](kchat/webapp@97c2c95de6a22298d0d8e940258759abdc3d77b6) by @philippe.karle ([merge request](kchat/webapp!706))

## 2.6.3-next.3 (2024-04-16)

### Fixed (3 changes)

- [fix ksuite bridge dnd register](kchat/webapp@00b8726876e5b4ce2b8863b603965007a1709674) by @antonbuksa
- [Fix: User profile popover going off screen when name length is too long](kchat/webapp@0cee0ea41565a6b632de5c43d7c9ff55d11ffe7c) by @philippe.karle ([merge request](kchat/webapp!713))
- [Fix: Change SuggestionBox placement based on textbox with rather than viewport width](kchat/webapp@502fb9399fe07e8ce9629e579993b32818b1e2e1) by @philippe.karle ([merge request](kchat/webapp!692))

## 2.6.3-next.2 (2024-04-15)

### Added (1 change)

- [log count of fetched profiles when fetching statuses](kchat/webapp@54b11e799d6432abdea0a0e22f439bdf001caf96) by @antonbuksa

### Fixed (2 changes)

- [Fix: option + esc shortcut error due to missing import](kchat/webapp@03e5972dd86b5f9dd120e474cf83c075c4a3a332) by @philippe.karle ([merge request](kchat/webapp!728))
- [Fix: close modal after joining channel](kchat/webapp@4eaa2304a43a41c7c5d0ec617de0ccb832380350) by @philippe.karle ([merge request](kchat/webapp!726))

## 2.6.3-next.1 (2024-04-12)

### Fixed (8 changes)

- [Fix: themes buttons not displaying properly on small devices](kchat/webapp@76681f69098cc7f549e947989b6a2eba5fb0ce9a) by @philippe.karle ([merge request](kchat/webapp!725))
- [Fix: Servers sidebar events runtime error due to missing value](kchat/webapp@e42e1504f955168a3af4994f395915ff51b2eb5d) by @philippe.karle ([merge request](kchat/webapp!724))
- [Fix: Insights hide deleted users](kchat/webapp@7a68d7cbd284e8ad11ae263a40cdb6df8d2f2346) by @philippe.karle ([merge request](kchat/webapp!659))
- [Fix: group channels members not loaded when category is collapsed](kchat/webapp@9e934c2c28b695d01eda422d7d3034acb8860fb5) by @philippe.karle ([merge request](kchat/webapp!693))
- [Fix: Remove unwanted paramterers from file extension coming from giphy](kchat/webapp@57c600a361278e213fa3fc4b1dbf0eb727ee70fa) by @philippe.karle ([merge request](kchat/webapp!714))
- [Fix: responsive sidebar link item overflowing](kchat/webapp@7029c421a0f0b5fdfc6defd3e83db7cff78b5485) by @philippe.karle ([merge request](kchat/webapp!712))
- [Fix: load deleted posts on channel switch](kchat/webapp@97c2c95de6a22298d0d8e940258759abdc3d77b6) by @philippe.karle ([merge request](kchat/webapp!706))
- [Fix threads attachement displaying undefined](kchat/webapp@92fd0ab8d5bbb494e72441906e788dae47a55d18) by @philippe.karle ([merge request](kchat/webapp!662))

## 2.6.2-rc.7 (2024-04-11)

### Added (1 change)

- [handle bridge dnd event](kchat/webapp@ead342b52dc6727fe8f3f96f0e7aa8b61273ef5c) by @antonbuksa ([merge request](kchat/webapp!719))

### Changed (1 change)

- [change new sidebar condition version](kchat/webapp@b3a865030fcc15fc304c463a21079eef85bb5cca) by @antonbuksa

## 2.6.2-rc.6 (2024-04-11)

### Added (2 changes)

- [Update: onboarding channels tour learn more link added](kchat/webapp@8186cdb713671b78ad225ce7a54061b10ce79c6a) by @philippe.karle ([merge request](kchat/webapp!722))
- [handle bridge dnd event](kchat/webapp@ead342b52dc6727fe8f3f96f0e7aa8b61273ef5c) by @antonbuksa ([merge request](kchat/webapp!719))

## 2.6.2-rc.5 (2024-04-11)

### Added (1 change)

- [add log for successful subscriptions to ws channels](kchat/webapp@fe32a7bbabbe2acb41bdcc6bd797e15db045b00e) by @antonbuksa ([merge request](kchat/webapp!721))

## 2.6.2-rc.4 (2024-04-10)

### Added (1 change)

- [add url param for disabling browser notifications on current session](kchat/webapp@3106f9fa0bef0c582388bcbcb51f079581b369ba) by @antonbuksa ([merge request](kchat/webapp!716))

## 2.6.2-rc.3 (2024-04-09)

### Fixed (1 change)

- [Fix: redirect to default channel on websocket reconnect](kchat/webapp@7c791594808ae4054da3258a184dec31ae9cb3ed) by @philippe.karle ([merge request](kchat/webapp!684))

## 2.6.2-rc.2 (2024-04-09)

### Added (1 change)

- [Ajout de l'id du bot lors de la création d'un bot account](kchat/webapp@512ffed65c6eb1944ba53014e201282cde37e0ad) by  ([merge request](kchat/webapp!710))

### Fixed (2 changes)

- [add cast for desktop status isSystemEvent param](kchat/webapp@67ec225aa58a14e56668189716891d1c1f5d1b59) by @antonbuksa ([merge request](kchat/webapp!715))
- [Fix: Wrong markdown shortcuts displayed](kchat/webapp@a28b0a9754b69e04649ef42708df9880adfe611f) by @philippe.karle ([merge request](kchat/webapp!711))

## 2.6.2-rc.1 (2024-04-08)

### Added (1 change)

- [Event to communicate between desktop & webapp implemented](kchat/webapp@34fea5398d9290b1ca3735b58b987dd3d72a512f) by @philippe.karle ([merge request](kchat/webapp!695))

### Changed (1 change)

- [limit sentry bt by env](kchat/webapp@7886c51cf5ac0a4f529e3d967b08f4e1bb796545) by @antonbuksa ([merge request](kchat/webapp!707))

## 2.6.2-next.5 (2024-04-11)

No changes.

## 2.6.2-next.4 (2024-04-11)

### Added (4 changes)

- [Update: onboarding channels tour learn more link added](kchat/webapp@8186cdb713671b78ad225ce7a54061b10ce79c6a) by @philippe.karle ([merge request](kchat/webapp!722))
- [add log for successful subscriptions to ws channels](kchat/webapp@fe32a7bbabbe2acb41bdcc6bd797e15db045b00e) by @antonbuksa ([merge request](kchat/webapp!721))
- [handle bridge dnd event](kchat/webapp@ead342b52dc6727fe8f3f96f0e7aa8b61273ef5c) by @antonbuksa ([merge request](kchat/webapp!719))
- [add url param for disabling browser notifications on current session](kchat/webapp@3106f9fa0bef0c582388bcbcb51f079581b369ba) by @antonbuksa ([merge request](kchat/webapp!716))

### Changed (1 change)

- [change new sidebar condition version](kchat/webapp@b3a865030fcc15fc304c463a21079eef85bb5cca) by @antonbuksa

## 2.6.2-next.3 (2024-04-09)

### Fixed (1 change)

- [Fix: redirect to default channel on websocket reconnect](kchat/webapp@7c791594808ae4054da3258a184dec31ae9cb3ed) by @philippe.karle ([merge request](kchat/webapp!684))

## 2.6.2-next.2 (2024-04-09)

### Added (1 change)

- [Ajout de l'id du bot lors de la création d'un bot account](kchat/webapp@512ffed65c6eb1944ba53014e201282cde37e0ad) by  ([merge request](kchat/webapp!710))

### Fixed (2 changes)

- [add cast for desktop status isSystemEvent param](kchat/webapp@67ec225aa58a14e56668189716891d1c1f5d1b59) by @antonbuksa ([merge request](kchat/webapp!715))
- [Fix: Wrong markdown shortcuts displayed](kchat/webapp@a28b0a9754b69e04649ef42708df9880adfe611f) by @philippe.karle ([merge request](kchat/webapp!711))

## 2.6.2-next.1 (2024-04-05)

No changes.

## 2.6.1-rc.6 (2024-04-05)

### Fixed (1 change)

- [Fix: drafts duplication & scheduled thread drafts not saved](kchat/webapp@d4bb616705c69870976f23463c38020efbb57911) by @philippe.karle ([merge request](kchat/webapp!694))

## 2.6.1-rc.5 (2024-04-05)

### Fixed (1 change)

- [fix logout on mobile](kchat/webapp@ce117615f1b7b36d1ee4113ca672da4142bcd679) by @antonbuksa ([merge request](kchat/webapp!705))

## 2.6.1-rc.4 (2024-04-03)

### Fixed (2 changes)

- [fix traduction DE](kchat/webapp@8519a0bf55e9c8b53b60eb16ce9fe9c65b8fe2f9) by  ([merge request](kchat/webapp!702))
- [Fix: message delete modal button focus state issue fixed](kchat/webapp@2f3c3c4f069ad097e0068f0163c2d2c94fb4dc13) by @philippe.karle ([merge request](kchat/webapp!701))

### Changed (1 change)

- [Shared message banner translation updated](kchat/webapp@4eceba050d2ec9ece83dd2935383a8a2572bcc54) by @philippe.karle ([merge request](kchat/webapp!700))

### Chore (1 change)

- [Revert "Merge branch 'rm/320644' into 'master'"](kchat/webapp@64f0e5c0cf98fb49f3d1524ad8cd2d3f17d81524) by @antonbuksa

## 2.6.1-rc.3 (2024-04-02)

No changes.

## 2.6.1-rc.2 (2024-04-02)

### Chore (1 change)

- [Revert "Merge branch 'rm/320644' into 'master'"](kchat/webapp@64f0e5c0cf98fb49f3d1524ad8cd2d3f17d81524) by @antonbuksa

## 2.6.1-rc.1 (2024-04-02)

### Fixed (5 changes)

- [Fix: Preview list extra white space removed](kchat/webapp@8edde5e68e377d9cdc2b1b46c4e74e69b687c8b1) by @philippe.karle ([merge request](kchat/webapp!697))
- [Fix: post_preview footer removed](kchat/webapp@547f7a2e7c448581006f182887d6b3f0bfc1db31) by @philippe.karle ([merge request](kchat/webapp!696))
- [Fix: empty groups channels on direct message modal solved](kchat/webapp@6cd69b1e1f77db141570b8fe56663729605ea205) by @philippe.karle ([merge request](kchat/webapp!686))
- [Fix: channel info sidebar with  wrong members total](kchat/webapp@6657a9ddd15ee561e0c0a0be625721eb67a9f7be) by @philippe.karle ([merge request](kchat/webapp!685))
- [Fix: filter duplicates within add user to channel modal](kchat/webapp@445363a40eabbe43670a8afe59e4d552ec3ffd92) by @philippe.karle ([merge request](kchat/webapp!682))

### Changed (1 change)

- [Neue(r) translation changed to Neu](kchat/webapp@9d4aaa98a571c9fcb61369b7776b18be6db4da38) by @philippe.karle ([merge request](kchat/webapp!689))

## 2.6.1-next.3 (2024-04-05)

### Fixed (1 change)

- [fix logout on mobile](kchat/webapp@ce117615f1b7b36d1ee4113ca672da4142bcd679) by @antonbuksa ([merge request](kchat/webapp!705))

## 2.6.1-next.2 (2024-04-03)

### Fixed (2 changes)

- [fix traduction DE](kchat/webapp@8519a0bf55e9c8b53b60eb16ce9fe9c65b8fe2f9) by  ([merge request](kchat/webapp!702))
- [Fix: message delete modal button focus state issue fixed](kchat/webapp@2f3c3c4f069ad097e0068f0163c2d2c94fb4dc13) by @philippe.karle ([merge request](kchat/webapp!701))

### Changed (1 change)

- [Shared message banner translation updated](kchat/webapp@4eceba050d2ec9ece83dd2935383a8a2572bcc54) by @philippe.karle ([merge request](kchat/webapp!700))

## 2.6.1-next.1 (2024-04-02)

### Fixed (5 changes)

- [Fix: Preview list extra white space removed](kchat/webapp@8edde5e68e377d9cdc2b1b46c4e74e69b687c8b1) by @philippe.karle ([merge request](kchat/webapp!697))
- [Fix: post_preview footer removed](kchat/webapp@547f7a2e7c448581006f182887d6b3f0bfc1db31) by @philippe.karle ([merge request](kchat/webapp!696))
- [Fix: empty groups channels on direct message modal solved](kchat/webapp@6cd69b1e1f77db141570b8fe56663729605ea205) by @philippe.karle ([merge request](kchat/webapp!686))
- [Fix: channel info sidebar with  wrong members total](kchat/webapp@6657a9ddd15ee561e0c0a0be625721eb67a9f7be) by @philippe.karle ([merge request](kchat/webapp!685))
- [Fix: filter duplicates within add user to channel modal](kchat/webapp@445363a40eabbe43670a8afe59e4d552ec3ffd92) by @philippe.karle ([merge request](kchat/webapp!682))

### Changed (1 change)

- [Neue(r) translation changed to Neu](kchat/webapp@9d4aaa98a571c9fcb61369b7776b18be6db4da38) by @philippe.karle ([merge request](kchat/webapp!689))

### Chore (1 change)

- [Revert "Merge branch 'rm/320644' into 'master'"](kchat/webapp@64f0e5c0cf98fb49f3d1524ad8cd2d3f17d81524) by @antonbuksa

## 2.6.0-rc.7 (2024-03-22)

No changes.

## 2.6.0-rc.6 (2024-03-22)

No changes.

## 2.6.0-rc.5 (2024-03-21)

### Fixed (2 changes)

- [Fix: Dutch translations that should be German](kchat/webapp@281e2e7d4a240a25d2b3a9e0db4ac24f295d26bb) by @philippe.karle ([merge request](kchat/webapp!688))
- [Remove insight new team members position columns due to empty values](kchat/webapp@02547a652412eb9f5a3c4710fbf78706338ce846) by @philippe.karle ([merge request](kchat/webapp!687))

## 2.6.0-rc.4 (2024-03-19)

### Fixed (1 change)

- [test proactive retry for code login](kchat/webapp@a4419ac026b5e8cfff53da7ab98e3f6bf43b5a84) by @antonbuksa

### Changed (1 change)

- [Update: Kdrive icon hover](kchat/webapp@ee3aba5015015a4e9ce95809deffeb239264dd75) by @philippe.karle ([merge request](kchat/webapp!681))

## 2.6.0-rc.3 (2024-03-19)

No changes.

## 2.6.0-rc.2 (2024-03-15)

### Fixed (1 change)

- [Fix: Desktop app add dropdown channel design fixed](kchat/webapp@35fe8d63f8f0ba04e298a95b7b705bf2b22a9a35) by @philippe.karle ([merge request](kchat/webapp!680))

## 2.6.0-rc.1 (2024-03-15)

### Added (1 change)

- [Dropdown switch server implemented](kchat/webapp@35e59f2dc775f6519454755852bf3999689e1867) by @philippe.karle ([merge request](kchat/webapp!665))

### Changed (1 change)

- [Dark theme contract and colors updated](kchat/webapp@7f1ddb1aeb7f6c4d34e4ab686a35b5f790a41bb6) by @philippe.karle ([merge request](kchat/webapp!677))

## 2.6.0-next.2 (2024-03-21)

### Fixed (3 changes)

- [Fix: Dutch translations that should be German](kchat/webapp@281e2e7d4a240a25d2b3a9e0db4ac24f295d26bb) by @philippe.karle ([merge request](kchat/webapp!688))
- [Remove insight new team members position columns due to empty values](kchat/webapp@02547a652412eb9f5a3c4710fbf78706338ce846) by @philippe.karle ([merge request](kchat/webapp!687))
- [test proactive retry for code login](kchat/webapp@a4419ac026b5e8cfff53da7ab98e3f6bf43b5a84) by @antonbuksa

### Changed (1 change)

- [Update: Kdrive icon hover](kchat/webapp@ee3aba5015015a4e9ce95809deffeb239264dd75) by @philippe.karle ([merge request](kchat/webapp!681))

## 2.6.0-next.1 (2024-03-15)

### Added (1 change)

- [Dropdown switch server implemented](kchat/webapp@35e59f2dc775f6519454755852bf3999689e1867) by @philippe.karle ([merge request](kchat/webapp!665))

### Fixed (1 change)

- [Fix: Desktop app add dropdown channel design fixed](kchat/webapp@35fe8d63f8f0ba04e298a95b7b705bf2b22a9a35) by @philippe.karle ([merge request](kchat/webapp!680))

### Changed (1 change)

- [Dark theme contract and colors updated](kchat/webapp@7f1ddb1aeb7f6c4d34e4ab686a35b5f790a41bb6) by @philippe.karle ([merge request](kchat/webapp!677))

## 2.5.2-rc.5 (2024-03-15)

### Added (1 change)

- [Guest banner popover modal added](kchat/webapp@675d885892531efe0ca9d7bfd49b9cbec0358e27) by @philippe.karle ([merge request](kchat/webapp!679))

## 2.5.2-rc.4 (2024-03-14)

### Fixed (3 changes)

- [Fix: using channel id passed as props to determine channel stats.](kchat/webapp@a17db968a44b2cbc5ac85fe99d224a4fbcee0b48) by @philippe.karle ([merge request](kchat/webapp!678))
- [Fix: action bar icons overlapping on small devices](kchat/webapp@b518893811d91ec96160fb4e280a55d637d16cf4) by @philippe.karle ([merge request](kchat/webapp!675))
- [Fix: Direct message from new person not showing up after websocket reconnection](kchat/webapp@880d46d3cf8a2d6bc8f868933fe7b80438c4c840) by @philippe.karle ([merge request](kchat/webapp!663))

## 2.5.2-rc.3 (2024-03-13)

No changes.

## 2.5.2-rc.2 (2024-03-13)

No changes.

## 2.5.2-rc.1 (2024-03-11)

### Fixed (1 change)

- [Fix: Loading & deleting deleted messages on web-socket reconnection](kchat/webapp@d16c983cc975832d0951518953d06b2793af56f2) by @philippe.karle ([merge request](kchat/webapp!673))

## 2.5.2-next.4 (2024-03-15)

### Added (1 change)

- [Guest banner popover modal added](kchat/webapp@675d885892531efe0ca9d7bfd49b9cbec0358e27) by @philippe.karle ([merge request](kchat/webapp!679))

### Changed (1 change)

- [Dark theme contract and colors updated](kchat/webapp@7f1ddb1aeb7f6c4d34e4ab686a35b5f790a41bb6) by @philippe.karle ([merge request](kchat/webapp!677))

## 2.5.2-next.3 (2024-03-14)

### Fixed (3 changes)

- [Fix: using channel id passed as props to determine channel stats.](kchat/webapp@a17db968a44b2cbc5ac85fe99d224a4fbcee0b48) by @philippe.karle ([merge request](kchat/webapp!678))
- [Fix: action bar icons overlapping on small devices](kchat/webapp@b518893811d91ec96160fb4e280a55d637d16cf4) by @philippe.karle ([merge request](kchat/webapp!675))
- [Fix: Direct message from new person not showing up after websocket reconnection](kchat/webapp@880d46d3cf8a2d6bc8f868933fe7b80438c4c840) by @philippe.karle ([merge request](kchat/webapp!663))

## 2.5.2-next.2 (2024-03-13)

No changes.

## 2.5.2-next.1 (2024-03-13)

### Added (1 change)

- [implement ksuite bridge send notification method](kchat/webapp@d151555cd3c2b2d75c07e642b9757ab342b8f1b2) by @antonbuksa

### Fixed (1 change)

- [Fix: Loading & deleting deleted messages on web-socket reconnection](kchat/webapp@d16c983cc975832d0951518953d06b2793af56f2) by @philippe.karle ([merge request](kchat/webapp!673))

## 2.5.1-rc.4 (2024-03-04)

### Fixed (1 change)

- [fix sidebar close icon fill](kchat/webapp@c9fba4fbf6fa7d176ebfdc7030c456bb019ce6da) by @antonbuksa ([merge request](kchat/webapp!670))

## 2.5.1-rc.3 (2024-03-01)

### Fixed (1 change)

- [fix map logic when disabling users already in chan when inviting](kchat/webapp@178567d0e5a50751641823e1b3e0f3ba6489aa29) by @antonbuksa ([merge request](kchat/webapp!668))

## 2.5.1-rc.2 (2024-03-01)

### Fixed (1 change)

- [Fix: Users appearing twice within the invite modal search input](kchat/webapp@d862a4ee99aec08138c9fc5782c014f091260cc0) by @philippe.karle ([merge request](kchat/webapp!666))

## 2.5.1-rc.1 (2024-02-28)

### Changed (1 change)

- [Websocket logs added to bind and unbind methods](kchat/webapp@9cc1bfdd4d3237ce61aa27f0f120f36f56ee0395) by @philippe.karle ([merge request](kchat/webapp!664))

## 2.5.1-next.3 (2024-03-04)

### Fixed (1 change)

- [fix sidebar close icon fill](kchat/webapp@c9fba4fbf6fa7d176ebfdc7030c456bb019ce6da) by @antonbuksa ([merge request](kchat/webapp!670))

## 2.5.1-next.2 (2024-03-01)

### Fixed (2 changes)

- [fix map logic when disabling users already in chan when inviting](kchat/webapp@178567d0e5a50751641823e1b3e0f3ba6489aa29) by @antonbuksa ([merge request](kchat/webapp!668))
- [Fix: Users appearing twice within the invite modal search input](kchat/webapp@d862a4ee99aec08138c9fc5782c014f091260cc0) by @philippe.karle ([merge request](kchat/webapp!666))

## 2.5.1-next.1 (2024-02-28)

### Changed (1 change)

- [Websocket logs added to bind and unbind methods](kchat/webapp@9cc1bfdd4d3237ce61aa27f0f120f36f56ee0395) by @philippe.karle ([merge request](kchat/webapp!664))

## 2.5.0-rc.19 (2024-02-27)

### Added (1 change)

- [wip implement ksuite header](kchat/webapp@0696b080f7ca8a8fdce245099cf3965c3a327d62) by @antonbuksa ([merge request](kchat/webapp!654))

## 2.5.0-rc.18 (2024-02-27)

### Fixed (1 change)

- [Post time link are disabled on system message](kchat/webapp@7a7c907d00de943fb4c8d6ffb3a699655291cee4) by @philippe.karle ([merge request](kchat/webapp!658))

### Changed (2 changes)

- [Mattermost link updated with kChat links](kchat/webapp@9e98887ad1905710a2daa1b43be328bb7d8ad9fe) by @philippe.karle ([merge request](kchat/webapp!661))
- [Call modal design up to date, buttons are now identical to desktop app](kchat/webapp@cd20e73b6f997e81ca23975957e67a3beeb6df52) by @philippe.karle ([merge request](kchat/webapp!656))

## 2.5.0-rc.17 (2024-02-27)

### Added (1 change)

- [add redmine automation to release script](kchat/webapp@69f482e7cf2310259344afdc2c8f159bbb05ef40) by @antonbuksa

### Fixed (2 changes)

- [Emoji list response fixed on small devices](kchat/webapp@179bb1c45081fad7c01bc0c02ffaa35c91cef700) by @philippe.karle ([merge request](kchat/webapp!660))
- [Fix: threads notifications are only received if the user has choosen to follow the conversation](kchat/webapp@bf9a8c1dcb178f85d87cb5c0d886f9194a9066cc) by @philippe.karle ([merge request](kchat/webapp!657))

## 2.5.0-rc.16 (2024-02-23)

### Fixed (3 changes)

- [Banner join channel logic extracted from TextEditor component & planned draft issue fixed](kchat/webapp@71d956cee3e523f8fba910f8b90f3d9e2d29452a) by @philippe.karle ([merge request](kchat/webapp!655))
- [Missing forward modal translations added](kchat/webapp@b516e83e03145677bc3a7e7430cc893e82547496) by @philippe.karle ([merge request](kchat/webapp!653))
- [Missing markdown translations added for main languages](kchat/webapp@5a87a9fcdd275b4a8863762a51bd7ee72ad37548) by @philippe.karle ([merge request](kchat/webapp!652))

## 2.5.0-rc.15 (2024-02-22)

### Fixed (1 change)

- [Fix: cannot invite poeple that are already in the channel group](kchat/webapp@d403477b942fffc9566489bac822ee03269e4e33) by @philippe.karle ([merge request](kchat/webapp!650))

## 2.5.0-rc.14 (2024-02-22)

### Fixed (1 change)

- [fix mas banner condition](kchat/webapp@99850e5fa6d26a911a41d5ad28d25adb910d1906) by @antonbuksa

## 2.5.0-rc.13 (2024-02-22)

### Fixed (1 change)

- [fix mas banner showing on web](kchat/webapp@c586fa064506f1021bdfe20bea99f099a05d4dd5) by @antonbuksa

## 2.5.0-rc.12 (2024-02-22)

### Fixed (1 change)

- [temp fix for floating input clear button in create category dialog](kchat/webapp@5de8415b5c4c764e1ce8fa53eb1d5989ad1ea8c1) by @antonbuksa ([merge request](kchat/webapp!649))

## 2.5.0-rc.11 (2024-02-22)

### Chore (2 changes)

- [handle rc tags in changelog parse_version](kchat/webapp@9e2879cf1d4d2bb4edb946a22be94faee049a0a1) by @antonbuksa
- [improve last version parser in release script](kchat/webapp@2b49ce995f1f0ab36d370182d4135b41d0fc63bf) by @antonbuksa

## 2.5.0-rc.10 (2024-02-22)

### Added (3 changes)

- [implement announcement banner for mas migration](kchat/webapp@df10b761dfcd8c370b74bf246faa9b78ed06e739) by @antonbuksa ([merge request](kchat/webapp!639))
- [Handle join channel without a member registration.](kchat/webapp@bedfb6998b10a49cb6889a8c9fdcf4f1fb88828c) by @benoit.nau ([merge request](kchat/webapp!608))
- [Log added on create thread fail](kchat/webapp@d555cbf9fdc27ecf396808af692947bad1ce062c) by @philippe.karle ([merge request](kchat/webapp!632))

### Fixed (8 changes)

- [Status partially hidden fixed](kchat/webapp@937d88e008bda0a9ed270631db2f76fcfd13cc92) by @philippe.karle ([merge request](kchat/webapp!647))
- [fix mas banner flag type is string](kchat/webapp@47f6424d245ee3c983b6f10796b61229bbe3b218) by @antonbuksa ([merge request](kchat/webapp!639))
- [Fix: is typing... message is not shorteneted anymore when enough space to display](kchat/webapp@c80701e2fc5a048594316dd1a76de53de7788f04) by @philippe.karle ([merge request](kchat/webapp!645))
- [Fix: deleting focus condition to trigger notification when current tab is not focused](kchat/webapp@42d5e7115d778549502571de66457760f0ba7ac6) by @philippe.karle ([merge request](kchat/webapp!643))
- [Fix: AnnouncementBar logic condition updated](kchat/webapp@6006bfee57c6aece94144ba5a107dd3859e1e83d) by @philippe.karle ([merge request](kchat/webapp!642))
- [Fix: file item taking full width when expend mode is activated on file search modal](kchat/webapp@866056a4ca023e15ec1a263eafb2fc6d46d95245) by @philippe.karle ([merge request](kchat/webapp!638))
- [Fix time floating underneath flags on compact mode](kchat/webapp@9c82413959de728c27a5757d4786a18459fcac21) by @philippe.karle ([merge request](kchat/webapp!634))
- [fix draft code discrepancy between post and pre monorepo draft actions](kchat/webapp@704ad5649aa072ab3289de7ae18788eed652fd04) by @antonbuksa ([merge request](kchat/webapp!631))

### Changed (4 changes)

- [Modal invitation limit increased to 10 users at the same time](kchat/webapp@947db16b9ebdd409daf0e8c9fd67b72252621421) by @philippe.karle ([merge request](kchat/webapp!644))
- [Back button changed displayed app name](kchat/webapp@a5647f4ebb2071645caa40a97b3b8acc547d0b63) by @philippe.karle ([merge request](kchat/webapp!641))
- [Channel private to public question translation updated](kchat/webapp@a6bdba5972010af01b595afa441ecc0b2c6b0bca) by @philippe.karle ([merge request](kchat/webapp!637))
- [Link to see built-in slash commands updated](kchat/webapp@b3fd521ca5f37c7c727d54cf083752c3258be831) by @philippe.karle ([merge request](kchat/webapp!633))

### Removed (2 changes)

- [Revert "Assign the responsability to display the preview component outside the text editor"](kchat/webapp@3a6806ca7f0007f7cf22e8943a47770df6207ded) by @antonbuksa
- [Team name removed from channel search pannel](kchat/webapp@2272a0cd71a9673062cc92b5136a62a700f2a216) by @philippe.karle ([merge request](kchat/webapp!636))

### Chore (1 change)

- [test changelog](kchat/webapp@d729c988ff661103e7952e3194ac9c04107cdc6f) by @antonbuksa

## 2.5.0-rc.9 (2024-02-21)

No changes.

## 2.5.0-rc.8 (2024-02-21)

### Fixed (1 change)

- [fix mas banner flag type is string](kchat/webapp@47f6424d245ee3c983b6f10796b61229bbe3b218) by @antonbuksa ([merge request](kchat/webapp!639))

## 2.5.0-rc.7 (2024-02-21)

### Fixed (1 change)

- [Fix: deleting focus condition to trigger notification when current tab is not focused](kchat/webapp@42d5e7115d778549502571de66457760f0ba7ac6) by @philippe.karle ([merge request](kchat/webapp!643))

### Changed (1 change)

- [Modal invitation limit increased to 10 users at the same time](kchat/webapp@947db16b9ebdd409daf0e8c9fd67b72252621421) by @philippe.karle ([merge request](kchat/webapp!644))

## 2.5.0-rc.6 (2024-02-20)

### Added (2 changes)

- [Assign the responsability to display the preview component outside the text editor](kchat/webapp@ed1acca606e3ef905d621791010319d782ceb516) by @benoit.nau ([merge request](kchat/webapp!640))
- [Handle join channel without a member registration.](kchat/webapp@bedfb6998b10a49cb6889a8c9fdcf4f1fb88828c) by @benoit.nau ([merge request](kchat/webapp!608))

### Fixed (3 changes)

- [Fix: AnnouncementBar logic condition updated](kchat/webapp@6006bfee57c6aece94144ba5a107dd3859e1e83d) by @philippe.karle ([merge request](kchat/webapp!642))
- [Fix: file item taking full width when expend mode is activated on file search modal](kchat/webapp@866056a4ca023e15ec1a263eafb2fc6d46d95245) by @philippe.karle ([merge request](kchat/webapp!638))
- [fix draft code discrepancy between post and pre monorepo draft actions](kchat/webapp@704ad5649aa072ab3289de7ae18788eed652fd04) by @antonbuksa ([merge request](kchat/webapp!631))

### Changed (2 changes)

- [Back button changed displayed app name](kchat/webapp@a5647f4ebb2071645caa40a97b3b8acc547d0b63) by @philippe.karle ([merge request](kchat/webapp!641))
- [Channel private to public question translation updated](kchat/webapp@a6bdba5972010af01b595afa441ecc0b2c6b0bca) by @philippe.karle ([merge request](kchat/webapp!637))

## 2.5.0-rc.5 (2024-02-19)

### Added (1 change)

- [Log added on create thread fail](kchat/webapp@d555cbf9fdc27ecf396808af692947bad1ce062c) by @philippe.karle ([merge request](kchat/webapp!632))

### Fixed (1 change)

- [Fix time floating underneath flags on compact mode](kchat/webapp@9c82413959de728c27a5757d4786a18459fcac21) by @philippe.karle ([merge request](kchat/webapp!634))

### Changed (1 change)

- [Link to see built-in slash commands updated](kchat/webapp@b3fd521ca5f37c7c727d54cf083752c3258be831) by @philippe.karle ([merge request](kchat/webapp!633))

## 2.5.0-rc.4 (2024-02-19)

### Chore (1 change)

- [test changelog](kchat/webapp@d729c988ff661103e7952e3194ac9c04107cdc6f) by @antonbuksa

## 2.5.0-next.9 (2024-02-27)

### Added (1 change)

- [wip implement ksuite header](kchat/webapp@0696b080f7ca8a8fdce245099cf3965c3a327d62) by @antonbuksa ([merge request](kchat/webapp!654))

## 2.5.0-next.8 (2024-02-27)

### Added (1 change)

- [add redmine automation to release script](kchat/webapp@69f482e7cf2310259344afdc2c8f159bbb05ef40) by @antonbuksa

### Fixed (3 changes)

- [Emoji list response fixed on small devices](kchat/webapp@179bb1c45081fad7c01bc0c02ffaa35c91cef700) by @philippe.karle ([merge request](kchat/webapp!660))
- [Post time link are disabled on system message](kchat/webapp@7a7c907d00de943fb4c8d6ffb3a699655291cee4) by @philippe.karle ([merge request](kchat/webapp!658))
- [Fix: threads notifications are only received if the user has choosen to follow the conversation](kchat/webapp@bf9a8c1dcb178f85d87cb5c0d886f9194a9066cc) by @philippe.karle ([merge request](kchat/webapp!657))

### Changed (2 changes)

- [Mattermost link updated with kChat links](kchat/webapp@9e98887ad1905710a2daa1b43be328bb7d8ad9fe) by @philippe.karle ([merge request](kchat/webapp!661))
- [Call modal design up to date, buttons are now identical to desktop app](kchat/webapp@cd20e73b6f997e81ca23975957e67a3beeb6df52) by @philippe.karle ([merge request](kchat/webapp!656))

## 2.5.0-next.7 (2024-02-23)

### Fixed (3 changes)

- [Banner join channel logic extracted from TextEditor component & planned draft issue fixed](kchat/webapp@71d956cee3e523f8fba910f8b90f3d9e2d29452a) by @philippe.karle ([merge request](kchat/webapp!655))
- [Missing forward modal translations added](kchat/webapp@b516e83e03145677bc3a7e7430cc893e82547496) by @philippe.karle ([merge request](kchat/webapp!653))
- [Missing markdown translations added for main languages](kchat/webapp@5a87a9fcdd275b4a8863762a51bd7ee72ad37548) by @philippe.karle ([merge request](kchat/webapp!652))

## 2.5.0-next.6 (2024-02-22)

### Fixed (6 changes)

- [fix mas banner condition](kchat/webapp@99850e5fa6d26a911a41d5ad28d25adb910d1906) by @antonbuksa
- [Fix: cannot invite poeple that are already in the channel group](kchat/webapp@d403477b942fffc9566489bac822ee03269e4e33) by @philippe.karle ([merge request](kchat/webapp!650))
- [fix mas banner showing on web](kchat/webapp@c586fa064506f1021bdfe20bea99f099a05d4dd5) by @antonbuksa
- [temp fix for floating input clear button in create category dialog](kchat/webapp@5de8415b5c4c764e1ce8fa53eb1d5989ad1ea8c1) by @antonbuksa ([merge request](kchat/webapp!649))
- [Status partially hidden fixed](kchat/webapp@937d88e008bda0a9ed270631db2f76fcfd13cc92) by @philippe.karle ([merge request](kchat/webapp!647))
- [Fix: is typing... message is not shorteneted anymore when enough space to display](kchat/webapp@c80701e2fc5a048594316dd1a76de53de7788f04) by @philippe.karle ([merge request](kchat/webapp!645))

### Removed (1 change)

- [Team name removed from channel search pannel](kchat/webapp@2272a0cd71a9673062cc92b5136a62a700f2a216) by @philippe.karle ([merge request](kchat/webapp!636))

### Chore (2 changes)

- [handle rc tags in changelog parse_version](kchat/webapp@9e2879cf1d4d2bb4edb946a22be94faee049a0a1) by @antonbuksa
- [improve last version parser in release script](kchat/webapp@2b49ce995f1f0ab36d370182d4135b41d0fc63bf) by @antonbuksa

## 2.5.0-next.5 (2024-02-21)

### Added (1 change)

- [implement announcement banner for mas migration](kchat/webapp@df10b761dfcd8c370b74bf246faa9b78ed06e739) by @antonbuksa ([merge request](kchat/webapp!639))

### Fixed (2 changes)

- [fix mas banner flag type is string](kchat/webapp@47f6424d245ee3c983b6f10796b61229bbe3b218) by @antonbuksa ([merge request](kchat/webapp!639))
- [Fix: deleting focus condition to trigger notification when current tab is not focused](kchat/webapp@42d5e7115d778549502571de66457760f0ba7ac6) by @philippe.karle ([merge request](kchat/webapp!643))

### Changed (1 change)

- [Modal invitation limit increased to 10 users at the same time](kchat/webapp@947db16b9ebdd409daf0e8c9fd67b72252621421) by @philippe.karle ([merge request](kchat/webapp!644))

### Removed (1 change)

- [Revert "Assign the responsability to display the preview component outside the text editor"](kchat/webapp@3a6806ca7f0007f7cf22e8943a47770df6207ded) by @antonbuksa

## 2.5.0-next.4 (2024-02-20)

### Added (2 changes)

- [Assign the responsability to display the preview component outside the text editor](kchat/webapp@ed1acca606e3ef905d621791010319d782ceb516) by @benoit.nau ([merge request](kchat/webapp!640))
- [Handle join channel without a member registration.](kchat/webapp@bedfb6998b10a49cb6889a8c9fdcf4f1fb88828c) by @benoit.nau ([merge request](kchat/webapp!608))

### Fixed (2 changes)

- [Fix: AnnouncementBar logic condition updated](kchat/webapp@6006bfee57c6aece94144ba5a107dd3859e1e83d) by @philippe.karle ([merge request](kchat/webapp!642))
- [Fix: file item taking full width when expend mode is activated on file search modal](kchat/webapp@866056a4ca023e15ec1a263eafb2fc6d46d95245) by @philippe.karle ([merge request](kchat/webapp!638))

### Changed (1 change)

- [Back button changed displayed app name](kchat/webapp@a5647f4ebb2071645caa40a97b3b8acc547d0b63) by @philippe.karle ([merge request](kchat/webapp!641))

## 2.5.0-next.3 (2024-02-19)

### Added (1 change)

- [Log added on create thread fail](kchat/webapp@d555cbf9fdc27ecf396808af692947bad1ce062c) by @philippe.karle ([merge request](kchat/webapp!632))

### Fixed (1 change)

- [Fix time floating underneath flags on compact mode](kchat/webapp@9c82413959de728c27a5757d4786a18459fcac21) by @philippe.karle ([merge request](kchat/webapp!634))

### Changed (2 changes)

- [Channel private to public question translation updated](kchat/webapp@a6bdba5972010af01b595afa441ecc0b2c6b0bca) by @philippe.karle ([merge request](kchat/webapp!637))
- [Link to see built-in slash commands updated](kchat/webapp@b3fd521ca5f37c7c727d54cf083752c3258be831) by @philippe.karle ([merge request](kchat/webapp!633))

### Chore (1 change)

- [test changelog](kchat/webapp@d729c988ff661103e7952e3194ac9c04107cdc6f) by @antonbuksa

## 2.4.0 (2024-02-16)

No changes.

## 2.4.0-next.2 (2024-02-16)

No changes.

## 2.4.0-rc.3 (2024-02-16)

No changes.

## 2.0.0 (2024-01-24)

### Chore (1 change)

- Monorepo migration
