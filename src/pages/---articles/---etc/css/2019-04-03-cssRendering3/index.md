---
title: "Css Rendering 3"
date: "2019-04-03T08:16:35.750Z"
layout: post
draft: false
path: "/etc/css-rendering-3/"
category: "css"
tags:
- "CSSOM"
description: "Code spitz에서 강의한 Css Rendering 3 CSSOM (css 객체 모델)내용을 정리한 글입니다. CSSOM 을 이용하여 DOM 을 조작하지 않고도 성능저하 없이 화면을 조정 할 수 있다는 것을 알게 되었습니다."
---

## CSSOM & VENDOR PREFIX

> CSS 객체모델 & 브라우저 접두어   

[코드스피츠](https://www.youtube.com/channel/UCKXBpFPbho1tp-Ntlfc25kA)
채널에서 보고 정리한 글입니다.

---

## Css object model

- Html의 텍스트를 메모리상의 구조로 만드는것은 Css object model 이다.
- Html 의 태크는 일종의 컨터이너 역할이다.
- Style태그의 실체는 Sheet 속성에 있는 cssStyleSheet 객체이다.

        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Title</title>
          </head>
        
          <style id="s">
            .test {
              background: #ff0;
            }
          </style>
        
          <body>
            <script>
              const el = document.querySelector('#s');
        			const sheet = el.sheet;
        			const rules = sheet.cssRules;
        			const rule = rules[0];
        			console.log(rule.selectorText);
        			console.log(rule.style.background);
            </script>
          </body>
        </html>

    ![](Untitled-8b2002a4-2cb6-43c6-9390-12a1eea209d6.png)

[CSSRule](https://developer.mozilla.org/en-US/docs/Web/API/CSSRule)

  | **Type**                   | **Value** | **Rule-specific interface** |
  | -------------------------- | --------- | --------------------------- |
  | **CSSRule.STYLE_RULE**     | 1         | CSSStyleRule                |
  | **CSSRule.IMPORT_RULE**    | 3         | CSSImportRule               |
  | **CSSRule.MEDIA_RULE**     | 4         | CSSMediaRule                |
  | **CSSRule.FONT_FACE_RULE** | 5         | CSSFontFaceRule             |
  | **CSSRule.PAGE_RULE**      | 6         | CSSPageRule                 |
  | **CSSRule.KEYFRAMES_RULE** | 7         | CSSKeyframesRule            |
  | **...**                    |           |                             |

## Insert Rule

- 동적으로 css 추가 rules에 추가 하는것이 아니라 sheet에 의뢰를 해야된다.(sheet에 추가해달라고 해야한다.)
- style rule은 뒷순서로 적혀있는 것이 우선이 된다.
- styleSheet를 건들이면 inlineTag를 건드리는것보다 훨씬좋다. (일괄 적용이 가능, inlineStyle을 건들이는 것이 아니라 css를 건들이는 것은성능상의 저하가 거의 없다.  돔을 건들이지 않는다.)

        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Title</title>
          </head>
        
          <style id="s">
            .test {
              background: #ff0;
            }
          </style>
        
          <body>
            <div class="red red1">red</div>
            <div class="blue blue1">blue</div>
            <div class="red">red</div>
            <div class="blue">blue</div>
            <div class="red">red</div>
            <div class="blue">blue</div>
            <div class="red">red</div>
            <div class="blue">blue</div>
            <script>
              const el = document.querySelector('#s');
              const sheet = el.sheet;
              const rules = sheet.cssRules;
              const rule = rules[0];
        
              document.querySelector('.red1').onclick = _ => {
                sheet.insertRule('.red{background:red}', rules.length);
                sheet.insertRule('.blue{background:blue}', rules.length);
              };
        
              document.querySelector('.blue1').onclick = _ => {
                sheet.deleteRule(rules.length - 1);
              };
        
              console.log(
                Array.from(rules)
                  .map(v => v.cssText)
                  .join('\n')
              );
            </script>
          </body>
        </html
  <video controls autoplay loop>
      <source src="./insertRule.mov" type="video/mp4">
        Your browser does not support the video tag.
  </video>

## Compatibility Library 만들기

- Vendor Prefix
    - Runtime Fetch (**실행 중에 확인해야 한다**.)
- Unsupported Property
    - graceful fail (우아하게 처리)
- Hierarchy Optimize
    - Sheet.disabled=true;

## Classes

![](Untitled-defacaa0-be84-4651-93d9-bfe4997f6e82.png)

- Vendor Prefix
    - Runtime Fetch (**실행 중에 확인해야 한다**.)
    - document body style 에게 물어봐야 한다.

            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <title>Title</title>
                <style></style>
              </head>
            
              <style id="s">
                .test {
                  background: #ff0;
                }
              </style>
            
              <body>
                <div class="test">test</div>
            
                <script>
                  const Style = (_ => {
                    const prop = new Map(),
                      prefix = 'webkit,moz,ms,chrom,o,khtml'.split(',');
                    const NONE = Symbol();
                    const BASE = document.body.style;
                    const getKey = key => {
                      if (prop.has(key)) return prop.get(key);
                      if (key in BASE) prop.set(key, key);
                      else if (
                        !prefix.some(v => {
                          //프리픽스를 붙인 속성은 존재하는가?
                          const newKey = v + key[0].toUpperCase() + key.substr(1);
                          if (newKey in BASE) {
                            prop.set(key, newKey);
                            key = newKey;
                            return true;
                          } else return false;
                        })
                      ) {
                        prop.set(key, NONE);
                        key = NONE; //프리픽스로도 안되면 없는 키!
                      }
                      return key;
                    };
                    return class {
                      constructor(style) {
                        this._style = style;
                      }
                      get(key) {
                        key = getKey(key);
                        if (key === NONE) return null;
                        return this._style[key];
                      }
                      set(key, val) {
                        key = getKey(key);
                        if (key !== NONE) this._style[key] = val;
                        return this;
                      }
                    };
                  })();
            
                  const Rule = class {
                    constructor(rule) {
                      this._rule = rule;
                      this._style = new Style(rule.style);
                    }
                    get(key) {
                      return this._style.get(key);
                    }
                    set(key, val) {
                      this._style.set(key, val);
                      return this;
                    }
                  };
            
                  const Sheet = class {
                    constructor(sheet) {
                      this._sheet = sheet;
                      this._rules = new Map(); //위의 Rule 클래스를 사용하기 위해
                    }
                    add(selector) {
                      const index = this._sheet.cssRules.length;
                      this._sheet.insertRule(`${selector}{}`, index);
                      const cssRule = this._sheet.cssRules[index];
                      const rule = new Rule(cssRule);
                      this._rules.set(selector, rule);
                      return rule;
                    }
                    remove(selector) {
                      if (!this._rules.has(selector)) return;
                      const rule = this._rules.get(selector);
                      Array.from(this._sheet.cssRules).some((cssRule, index) => {
                        if (cssRule === rule._rule) {
                          this._sheet.deleteRule(index);
                          return true;
                        }
                      });
                    }
                    get(selector) {
                      return this._rules.get(selector);
                    }
                  };
            
                  const sheet = new Sheet(document.styleSheets[1]);
                  sheet.add('body').set('background', '#f00');
                  sheet
                    .add('.test')
                    .set(
                      'cssText',
                      'width:200px; border:1px solid #fff; color:#000; background:#fff'
                    );
                  // sheet.remove('.test');
                </script>
              </body>
            </html>

    ![](Untitled-d7753fc5-0d8e-41bf-a8f4-18e52a4f2609.png)

        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <title>Title</title>
            <style></style>
          </head>
        
          <style id="s">
            .test {
              background: #f00;
              animation: size 1s infinite alternate;
            }
          </style>
        
          <body>
            <div class="test">test</div>
        
            <script>
              const Style = (_ => {
                const prop = new Map(),
                  prefix = 'webkit,moz,ms,chrom,o,khtml'.split(',');
                const NONE = Symbol();
                const BASE = document.body.style;
                const getKey = key => {
                  if (prop.has(key)) return prop.get(key);
                  if (key in BASE) prop.set(key, key);
                  else if (
                    !prefix.some(v => {
                      //프리픽스를 붙인 속성은 존재하는가?
                      const newKey = v + key[0].toUpperCase() + key.substr(1);
                      if (newKey in BASE) {
                        prop.set(key, newKey);
                        key = newKey;
                        return true;
                      } else return false;
                    })
                  ) {
                    prop.set(key, NONE);
                    key = NONE; //프리픽스로도 안되면 없는 키!
                  }
                  return key;
                };
                return class {
                  constructor(style) {
                    this._style = style;
                  }
                  get(key) {
                    key = getKey(key);
                    if (key === NONE) return null;
                    return this._style[key];
                  }
                  set(key, val) {
                    key = getKey(key);
                    if (key !== NONE) this._style[key] = val;
                    return this;
                  }
                };
              })();
        
              const Rule = class {
                constructor(rule) {
                  this._rule = rule;
                  this._style = new Style(rule.style);
                }
                get(key) {
                  return this._style.get(key);
                }
                set(key, val) {
                  this._style.set(key, val);
                  return this;
                }
              };
        
              const KeyFrameRule = class {
                constructor(rule) {
                  this._keyframe = rule;
                  this._rules = new Map(); //위의 Rule 클래스를 사용하기 위해
                }
                add(selector) {
                  const index = this._keyframe.cssRules.length;
                  this._keyframe.appendRule(`${selector}{}`, index);
                  const cssRule = this._keyframe.cssRules[index];
                  const rule = new Rule(cssRule);
                  this._rules.set(selector, rule);
                  return rule;
                }
                remove(selector) {
                  if (!this._rules.has(selector)) return;
                  const rule = this._rules.get(selector)._rule;
                  Array.from(this._keyframe.cssRules).some((cssRule, index) => {
                    if (cssRule === rule._rule) {
                      this._keyframe.deleteRule(index);
                      return true;
                    }
                  });
                }
              };
        
              const Sheet = class {
                constructor(sheet) {
                  this._sheet = sheet;
                  this._rules = new Map(); //위의 Rule 클래스를 사용하기 위해
                }
                add(selector) {
                  const index = this._sheet.cssRules.length;
                  this._sheet.insertRule(`${selector}{}`, index);
                  const cssRule = this._sheet.cssRules[index];
                  let rule;
                  if (selector.startsWith('@keyframes')) {
                    rule = new KeyFrameRule(cssRule);
                  } else {
                    rule = new Rule(cssRule);
                  }
                  this._rules.set(selector, rule);
                  return rule;
                }
                remove(selector) {
                  if (!this._rules.has(selector)) return;
                  const rule = this._rules.get(selector);
                  Array.from(this._sheet.cssRules).some((cssRule, index) => {
                    if (cssRule === rule._rule) {
                      this._sheet.deleteRule(index);
                      return true;
                    }
                  });
                }
                get(selector) {
                  return this._rules.get(selector);
                }
              };
        
              const sheet = new Sheet(document.styleSheets[1]);
              const size = sheet.add('@keyframes size');
              size.add('from').set('width', '0');
              size.add('to').set('width', '500px');
        
              // sheet.add('body').set('background', '#f00');
              // sheet
              //   .add('.test')
              //   .set(
              //     'cssText',
              //     'width:200px; border:1px solid #fff; color:#000; background:#fff'
              //   );
              // sheet.remove('.test');
            </script>
          </body>
        </html>
  <video controls autoplay loop>
      <source src="./keyframe_ex.mov" type="video/mp4">
        Your browser does not support the video tag.
  </video>

## Typed CSSOM

[CSS Typed OM Level 1](https://drafts.css-houdini.org/css-typed-om/)

w3가 아닌데 표준이라고 불린다.

houdin - 구글이 협회를  만들어서 css 요구한 바를 만들어서 draft로 제출한다고 하는 프로젝트이다. (구글은 w3를 싫어 한다..구글은 할 수 있는 것이 많은데 w3로 제한 받는 것을 싫어 하는 것 같다.)

- ~~$('#someDiv').style.height= getRandonInt() + 'px'~~
    - js 애니메이션 프레임워크에서 텍스트를 조립하는 과정이 속도를 저하시킨다.
    - 구글은 이를 싫어 한다.

            CSS.number(0.5)
            el.styleMap.set('opacity', CSS.number(0.5)
            
            CSS.px(500);
            el.styleMap.set('height',CSS.px(500));

[CSS](https://developer.mozilla.org/ko/docs/Web/API/CSS)

    CSS{
    	number, percent
    	em, ex, ch, ic, rem, lg, rlh, vw, vh ....... px
    }