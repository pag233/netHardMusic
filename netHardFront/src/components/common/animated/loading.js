import React from 'react';
import './loading.scss';
/**
 * spins的长度需要与scss文件中的 mixin spin($count)中的$count参数一致。
 * 且随着数量不同需要调整 minxin spin($count)中的animation-delay与时间匹配。
 */
export default function Loading({ className, size = 75, showText = true }) {
    const spins = [1, 2, 3, 4, 5, 6];
    const fontSize = size / 15 + 'px';
    const transformOrigin = Math.sin(Math.PI / 4) * size / 2;
    const spinStyle = {
        transformOrigin: `${transformOrigin}px ${transformOrigin}px`,
        left: size / 25 + 'px',
        top: size / 25 + 'px'
    };
    return (
        <div className={"loading-holder" + (className ? (" " + className) : "")}>
            <div className="loading-spins-container" style={{
                width: size + 'px',
                height: size + 'px',
                borderWidth: size * 0.1 + 'px'
            }}
            >
                {
                    spins.map((spin, idx) => {
                        if (idx === 0) return (
                            <div key={'spin' + spin} id='end' className="loading-spin spin-1" onAnimationEnd={() => {
                                const spins = document.querySelectorAll('.loading-spin');
                                spins.forEach(spin => {
                                    spin.className = "";
                                });
                                setTimeout(() => {
                                    //**hack */ 强制动画重新播放
                                    window.requestAnimationFrame(function () {
                                        window.requestAnimationFrame(function () {
                                            spins.forEach((spin, index) => {
                                                spin.className = `loading-spin spin-${index + 1}`;
                                            });
                                        });
                                    });
                                }, 500);
                            }}
                                style={spinStyle}
                            ></div>
                        );
                        return (
                            <div key={'spin' + spin} className={`loading-spin spin-${spin}`}
                                style={spinStyle}
                            ></div>
                        );
                    })
                }
            </div>
            <div className="loading-text" style={
                {
                    fontSize
                }
            }>
                {
                    showText && "加载中..."
                }
            </div>
        </div>
    );
}