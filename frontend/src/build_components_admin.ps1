<!DOCTYPE html>

<html className="dark" lang="zh-CN"><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>Glacier 绠＄悊鍚庡彴</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "tertiary": "#c8a0f0",
                    "tertiary-fixed": "#e8d0ff",
                    "on-surface-variant": "#a0b4c4",
                    "on-primary-fixed": "#001f2e",
                    "tertiary-fixed-dim": "#c8a0f0",
                    "surface-container-highest": "#202c42",
                    "on-tertiary-fixed-variant": "#4d2a73",
                    "secondary-fixed-dim": "#88b4cc",
                    "surface-tint": "#7dd3fc",
                    "surface-container": "#141c2e",
                    "on-error-container": "#ffb3b3",
                    "outline-variant": "#2a3a48",
                    "outline": "#4a6070",
                    "on-tertiary-container": "#e8d0ff",
                    "inverse-on-surface": "#0a0e1a",
                    "primary-fixed": "#c8eaff",
                    "on-background": "#e0e8f0",
                    "tertiary-container": "#3d2060",
                    "surface": "#0f1524",
                    "secondary-container": "#1a3a4e",
                    "on-tertiary-fixed": "#1a002e",
                    "background": "#0a0e1a",
                    "inverse-surface": "#e0e8f0",
                    "on-tertiary": "#1a002e",
                    "on-primary-fixed-variant": "#004d73",
                    "on-secondary-fixed": "#0d1f2b",
                    "on-secondary-container": "#c0d8e8",
                    "error": "#ff6b6b",
                    "primary-container": "#0e4d6e",
                    "on-surface": "#e0e8f0",
                    "secondary-fixed": "#c0d8e8",
                    "inverse-primary": "#0a4c6e",
                    "primary": "#7dd3fc",
                    "surface-container-lowest": "#0a0e1a",
                    "on-error": "#1a0000",
                    "on-secondary": "#001f2e",
                    "on-primary-container": "#c8eaff",
                    "surface-dim": "#0f1524",
                    "secondary": "#88b4cc",
                    "surface-variant": "#1a2438",
                    "on-primary": "#001f2e",
                    "surface-container-high": "#1a2438",
                    "surface-container-low": "#111828",
                    "surface-bright": "#1a2438",
                    "on-secondary-fixed-variant": "#2a4a5e",
                    "error-container": "#3d1414",
                    "primary-fixed-dim": "#7dd3fc"
            },
            "borderRadius": {
                    "DEFAULT": "0.5rem",
                    "lg": "1rem",
                    "xl": "1.5rem",
                    "full": "9999px"
            },
            "fontFamily": {
                    "headline": ["Inter"],
                    "body": ["Inter"],
                    "label": ["Inter"]
            }
          },
        },
      }
    </script>
<style>
        .glass-card {
            background: rgba(15, 21, 36, 0.6);
            backdrop-filter: blur(16px);
            border: 1px solid rgba(125, 211, 252, 0.1);
        }
        .glass-card-elevated {
            background: rgba(15, 21, 36, 0.75);
            backdrop-filter: blur(24px);
            border: 1px solid rgba(125, 211, 252, 0.15);
        }
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body className="bg-background text-on-surface font-body min-h-screen flex">

<aside className="w-64 h-screen sticky top-0 border-r border-sky-300/10 bg-slate-950/60 backdrop-blur-xl shadow-[0_0_30px_rgba(125,211,252,0.05)] hidden md:flex flex-col py-4 px-6 gap-2">
<div className="mb-8 px-2">
<h1 className="text-2xl font-black text-sky-300 tracking-tight">Glacier</h1>
<p className="text-xs text-slate-400">@glacier_admin</p>
</div>
<nav className="flex-1 flex flex-col gap-2">

<a className="flex items-center gap-3 px-4 py-3 text-sky-300 font-bold bg-sky-300/10 rounded-full transition-transform active:scale-95" href="#">
<span className="material-symbols-outlined" data-icon="dashboard">dashboard</span>
<span className="font-inter text-base">姒傝</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-400 font-regular hover:bg-slate-800/50 transition-colors duration-200 rounded-full active:scale-95" href="#">
<span className="material-symbols-outlined" data-icon="group">group</span>
<span className="font-inter text-base">鐢ㄦ埛绠＄悊</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-400 font-regular hover:bg-slate-800/50 transition-colors duration-200 rounded-full active:scale-95" href="#">
<span className="material-symbols-outlined" data-icon="gavel">gavel</span>
<span className="font-inter text-base">鍐呭瀹℃牳</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-400 font-regular hover:bg-slate-800/50 transition-colors duration-200 rounded-full active:scale-95" href="#">
<span className="material-symbols-outlined" data-icon="analytics">analytics</span>
<span className="font-inter text-base">鏁版嵁缁熻</span>
</a>
<a className="flex items-center gap-3 px-4 py-3 text-slate-400 font-regular hover:bg-slate-800/50 transition-colors duration-200 rounded-full active:scale-95" href="#">
<span className="material-symbols-outlined" data-icon="settings">settings</span>
<span className="font-inter text-base">璁剧疆</span>
</a>
</nav>
<div className="mt-auto pt-6 border-t border-sky-300/10 flex items-center gap-3 px-2">
<div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden ring-1 ring-sky-300/20">
<img alt="绠＄悊鍛樼敤鎴峰ご鍍? className="w-full h-full object-cover" data-alt="close-up portrait of a professional man with a neutral expression in a soft-lit studio setting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAqLRq9OVsqnECliTqLmaV5dyTL5xCoq5DZGgEInKePN9gsGS2A6OfY1xsKEJl4ESPH0a7lznsMgNKlLKhbuw7ssDInxiYTdaZZzJM-9TdR1CpouT8lZeitpTkmpeiMt_5AxeENoBoEXSf7oEjhg_zMYjWOSKYLi04Ye25RDZ0F8XC-f07ocF3XadQUo7T6RxmpXrANu7jZbiKCtlW9MV9FCoOazLI1bvbvOQhHegB7kpRA8BP6h4mU0Lxd9RYLrL64ma8GTaYG2Yw"/>
</div>
<div className="flex-1 min-w-0">
<p className="text-sm font-bold text-on-surface truncate">Admin Core</p>
<p className="text-xs text-on-surface-variant truncate">绯荤粺绾у埆</p>
</div>
</div>
</aside>
<main className="flex-1 flex flex-col min-w-0">

<header className="sticky top-0 z-50 border-b border-sky-300/10 bg-slate-950/75 backdrop-blur-2xl flex justify-between items-center px-6 py-3 w-full">
<div className="flex items-center gap-8">
<div className="md:hidden">
<h1 className="text-xl font-black text-sky-300">Glacier</h1>
</div>
<div className="hidden md:flex items-center gap-6">
<button className="text-sky-300 border-b-2 border-sky-300 pb-1 font-inter text-sm font-medium cursor-pointer transition-opacity active:opacity-70">鍏ㄥ眬瑙嗗浘</button>
<button className="text-slate-400 pb-1 font-inter text-sm font-medium hover:text-sky-200 cursor-pointer transition-opacity active:opacity-70">鍖哄煙璀︽姤</button>
</div>
</div>
<div className="flex items-center gap-4">
<div className="relative hidden sm:block">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm" data-icon="search">search</span>
<input className="bg-surface-container-low border border-sky-300/10 rounded-full py-1.5 pl-9 pr-4 text-sm focus:outline-none focus:ring-1 focus:ring-sky-300/30 w-64 placeholder:text-slate-500" placeholder="鎼滅储鏃ュ織銆佺敤鎴?.." type="text"/>
</div>
<button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-800/50 active:scale-95 transition-all">
<span className="material-symbols-outlined" data-icon="notifications">notifications</span>
</button>
<button className="w-10 h-10 flex items-center justify-center rounded-full text-slate-400 hover:bg-slate-800/50 active:scale-95 transition-all">
<span className="material-symbols-outlined" data-icon="tune">tune</span>
</button>
</div>
</header>

<div className="p-6 md:p-10 space-y-8">

<div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
<div>
<h2 className="text-3xl font-bold tracking-tight text-on-surface">骞冲彴姒傝</h2>
<p className="text-on-surface-variant mt-1">瀹炴椂绯荤粺杩愯鐘跺喌涓庣敤鎴峰弬涓庡害鎸囨爣銆?/p>
</div>
<div className="flex items-center gap-2">
<button className="px-4 py-2 bg-primary-container text-on-primary-container rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-sky-700 transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="download">download</span> 瀵煎嚭鎶ュ憡
                    </button>
<button className="px-4 py-2 bg-surface-variant border border-sky-300/10 text-on-surface rounded-lg text-sm font-semibold flex items-center gap-2 hover:bg-surface-container transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="calendar_today">calendar_today</span> 鏈€杩?4灏忔椂
                    </button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

<div className="glass-card p-5 rounded-xl flex flex-col justify-between group">
<div className="flex justify-between items-start">
<div className="w-10 h-10 rounded-lg bg-sky-300/10 flex items-center justify-center text-sky-300">
<span className="material-symbols-outlined" data-icon="person_add">person_add</span>
</div>
<span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">+12.4%</span>
</div>
<div className="mt-4">
<p className="text-sm text-on-surface-variant">鏂板鐢ㄦ埛</p>
<h3 className="text-2xl font-bold text-on-surface">2,842</h3>
</div>
<div className="mt-4 h-8 flex items-end gap-1">
<div className="flex-1 bg-sky-300/20 rounded-t-sm h-[40%]"></div>
<div className="flex-1 bg-sky-300/20 rounded-t-sm h-[60%]"></div>
<div className="flex-1 bg-sky-300/20 rounded-t-sm h-[45%]"></div>
<div className="flex-1 bg-sky-300/20 rounded-t-sm h-[80%]"></div>
<div className="flex-1 bg-sky-300/40 rounded-t-sm h-[100%]"></div>
</div>
</div>

<div className="glass-card p-5 rounded-xl flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="w-10 h-10 rounded-lg bg-tertiary/10 flex items-center justify-center text-tertiary">
<span className="material-symbols-outlined" data-icon="chat_bubble">chat_bubble</span>
</div>
<span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full">+8.1%</span>
</div>
<div className="mt-4">
<p className="text-sm text-on-surface-variant">鍙戝笘閲?/p>
<h3 className="text-2xl font-bold text-on-surface">14.2k</h3>
</div>
<div className="mt-4 h-8 flex items-end gap-1">
<div className="flex-1 bg-tertiary/20 rounded-t-sm h-[30%]"></div>
<div className="flex-1 bg-tertiary/20 rounded-t-sm h-[50%]"></div>
<div className="flex-1 bg-tertiary/40 rounded-t-sm h-[70%]"></div>
<div className="flex-1 bg-tertiary/20 rounded-t-sm h-[40%]"></div>
<div className="flex-1 bg-tertiary/20 rounded-t-sm h-[90%]"></div>
</div>
</div>

<div className="glass-card p-5 rounded-xl flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="w-10 h-10 rounded-lg bg-error/10 flex items-center justify-center text-error">
<span className="material-symbols-outlined" data-icon="report">report</span>
</div>
<span className="text-xs font-bold text-error bg-error/10 px-2 py-0.5 rounded-full">-4.2%</span>
</div>
<div className="mt-4">
<p className="text-sm text-on-surface-variant">琚爣璁板唴瀹?/p>
<h3 className="text-2xl font-bold text-on-surface">184</h3>
</div>
<div className="mt-4 h-8 flex items-end gap-1">
<div className="flex-1 bg-error/20 rounded-t-sm h-[80%]"></div>
<div className="flex-1 bg-error/20 rounded-t-sm h-[60%]"></div>
<div className="flex-1 bg-error/20 rounded-t-sm h-[50%]"></div>
<div className="flex-1 bg-error/40 rounded-t-sm h-[30%]"></div>
<div className="flex-1 bg-error/20 rounded-t-sm h-[20%]"></div>
</div>
</div>

<div className="glass-card p-5 rounded-xl flex flex-col justify-between">
<div className="flex justify-between items-start">
<div className="w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary">
<span className="material-symbols-outlined" data-icon="speed">speed</span>
</div>
<span className="text-xs font-bold text-on-surface-variant bg-surface-variant px-2 py-0.5 rounded-full">鏈€浣?/span>
</div>
<div className="mt-4">
<p className="text-sm text-on-surface-variant">鏈嶅姟鍣ㄨ礋杞?/p>
<h3 className="text-2xl font-bold text-on-surface">24%</h3>
</div>
<div className="mt-4 flex items-center gap-1.5 overflow-hidden">
<div className="flex-1 h-1.5 bg-sky-300 rounded-full"></div>
<div className="w-1/2 h-1.5 bg-sky-300/20 rounded-full"></div>
</div>
</div>
</div>

<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

<div className="lg:col-span-2 glass-card rounded-2xl overflow-hidden flex flex-col">
<div className="p-6 border-b border-sky-300/10 flex items-center justify-between">
<h3 className="font-bold text-lg">鏈€杩戠敤鎴锋椿鍔?/h3>
<button className="text-xs font-semibold text-sky-300 hover:underline">鏌ョ湅鍏ㄩ儴鏃ュ織</button>
</div>
<div className="overflow-x-auto">
<table className="w-full text-left">
<thead className="text-xs uppercase tracking-wider text-on-surface-variant border-b border-sky-300/10">
<tr>
<th className="px-6 py-4 font-semibold">鐢ㄦ埛</th>
<th className="px-6 py-4 font-semibold">鎿嶄綔</th>
<th className="px-6 py-4 font-semibold">鏃堕棿鎴?/th>
<th className="px-6 py-4 font-semibold">鐘舵€?/th>
</tr>
</thead>
<tbody className="text-sm divide-y divide-sky-300/5">
<tr className="hover:bg-sky-300/5 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<img className="w-8 h-8 rounded-full object-cover" data-alt="headshot of a smiling young man in a blue denim shirt" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHjtaa2UWkVrxSqwtEgv0X5PN--BoFOKjMIKoSTL_J-dpDyvfo9NPnXobw8e59FxsNmVAtRC_ie-8Man0fKlkJz8SlkUqnP8e5ZF5u_sUgKDfjM8stfxN2GkZn8wjnAAH3g9XUib7lCsfHs3PwOMkdy9iMO8WQEMN8dFlLUByy8RvWrjP7Ef-B6Dg9SDxTMlN2vJQWYXdPFlm_NzSV68mEJNES_s_XIESchfsVi7JZFwWFXzOVksdiwo85By_tMNeC66e7Z9HWNHU"/>
<div>
<p className="font-bold">Julian V.</p>
<p className="text-xs text-on-surface-variant">@j_vance</p>
</div>
</div>
</td>
<td className="px-6 py-4">鍙戝竷鏂板笘: "Morning in..."</td>
<td className="px-6 py-4 text-on-surface-variant">2 鍒嗛挓鍓?/td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 text-emerald-400">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            鎴愬姛
                                        </span>
</td>
</tr>
<tr className="hover:bg-sky-300/5 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<img className="w-8 h-8 rounded-full object-cover" data-alt="close-up portrait of a woman with curly hair smiling brightly at the camera" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB996H392fPjq2MtZAt9EZ1INkLkDvCezhpbPnIs6Er7EJV9pR5dwdRyDnFLapMFhn5TZR2z2nJJeqDeX1trct_8cmSnZrT9WHWcD5K-NFldLtagqzbQ_5qFI_qa32SLdRV0TDDT3iV-TeKq6GugxxQ1HeAX8mZL39K9wwTL-eg4cAdr2Ta5YCQE1O7H2AqMKTCSCAu1jMpKofqsEdqOYMCzwCigvJPD2Ks8Hd-VbcUF-g9oHvdivkVBF_LkQ2-G7cqy_-bhw7gXSg"/>
<div>
<p className="font-bold">Sarah K.</p>
<p className="text-xs text-on-surface-variant">@sk_explorer</p>
</div>
</div>
</td>
<td className="px-6 py-4">鐧诲綍灏濊瘯 (鏂拌澶?</td>
<td className="px-6 py-4 text-on-surface-variant">14 鍒嗛挓鍓?/td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 text-sky-300">
<span className="w-1.5 h-1.5 rounded-full bg-sky-300"></span>
                                            宸叉爣璁?                                        </span>
</td>
</tr>
<tr className="hover:bg-sky-300/5 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<img className="w-8 h-8 rounded-full object-cover" data-alt="vibrant portrait of a man with spectacles looking thoughtfully into the distance" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT4IjaDh6V9xYEcibGqyqAb3t9zELiQXXTYV59Sv54cj6ycuO-d0sdMp8WUWALgNOZ-uLZEL1KjBt7eFNqe5qu7wM9QLdkffUuK5VMVcU8yBr_p9byS5BYqfoual6bCGirBWbUMRkjHG0djipW3Ar4uSYFaw3k1tXrcUGGP0CCstN0wf14rRtur_3-ANkdR2ySc8sjRXSgbvUP2kGFhVjkuvA-kRTsTlAhAos9wK-CB1seHwwCvdb9EhFvWmHNXpXeEocaIlM9JCc"/>
<div>
<p className="font-bold">Marco D.</p>
<p className="text-xs text-on-surface-variant">@marcod_dev</p>
</div>
</div>
</td>
<td className="px-6 py-4">鍒犻櫎浜嗚瘎璁?#492</td>
<td className="px-6 py-4 text-on-surface-variant">32 鍒嗛挓鍓?/td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 text-on-surface-variant">
<span className="w-1.5 h-1.5 rounded-full bg-on-surface-variant"></span>
                                            宸插垹闄?                                        </span>
</td>
</tr>
<tr className="hover:bg-sky-300/5 transition-colors">
<td className="px-6 py-4">
<div className="flex items-center gap-3">
<img className="w-8 h-8 rounded-full object-cover" data-alt="professional woman in corporate attire sitting in a bright modern office workspace" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBv4NDkSYN_QAaWdNfHB5cjFt_Cjl50mAejetupMm4u7KLdYUMMuamAYwbxfuVqBmdluyIKEtiyBIB6WCcUbCg7dxWWeIOEiDyPYBbZOhNI0N4pqqDg2YTRr-nGsGg8CFUq1sN4OwVKT12mQYHQoyhbmlemksFhgQgbbVLR31NHCz6zAyNGGFXhU1s3uTGNfvloAYoX_xipmLXKBl4f8JRND1Bs5DcqIgO8VXIKne5EwihXxCxNPm8bkrLKxCrE6Hs-g5wDhMTaqhs"/>
<div>
<p className="font-bold">Elena R.</p>
<p className="text-xs text-on-surface-variant">@elena_rocks</p>
</div>
</div>
</td>
<td className="px-6 py-4">鏇存柊浜嗕釜浜鸿祫鏂欒缃?/td>
<td className="px-6 py-4 text-on-surface-variant">1 灏忔椂鍓?/td>
<td className="px-6 py-4">
<span className="inline-flex items-center gap-1.5 text-emerald-400">
<span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                                            鎴愬姛
                                        </span>
</td>
</tr>
</tbody>
</table>
</div>
</div>

<div className="space-y-6">

<div className="glass-card p-6 rounded-2xl relative overflow-hidden group">
<div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
<span className="material-symbols-outlined text-6xl" data-icon="gavel">gavel</span>
</div>
<h3 className="font-bold text-lg mb-4 flex items-center gap-2">
<span className="material-symbols-outlined text-error" data-icon="priority_high">priority_high</span>
                            寰呭鏍搁」鐩?                        </h3>
<div className="space-y-4">
<div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container-highest border border-error/20">
<span className="material-symbols-outlined text-error" data-icon="warning">warning</span>
<div className="flex-1">
<p className="text-xs font-bold text-on-surface">妫€娴嬪埌鍨冨溇淇℃伅娉?/p>
<p className="text-[10px] text-on-surface-variant uppercase">闇€瑕佹搷浣滐細42 涓笘瀛?/p>
</div>
<button className="p-1 hover:bg-error/10 rounded-md transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
</button>
</div>
<div className="flex items-center gap-3 p-3 rounded-xl bg-surface-container border border-sky-300/10">
<span className="material-symbols-outlined text-sky-300" data-icon="report">report</span>
<div className="flex-1">
<p className="text-xs font-bold text-on-surface">鐢ㄦ埛鎶ュ憡 #9012</p>
<p className="text-[10px] text-on-surface-variant uppercase">韬唤楠岃瘉</p>
</div>
<button className="p-1 hover:bg-sky-300/10 rounded-md transition-colors">
<span className="material-symbols-outlined text-sm" data-icon="chevron_right">chevron_right</span>
</button>
</div>
</div>
<button className="w-full mt-6 py-2 rounded-xl bg-on-surface text-inverse-on-surface text-sm font-bold active:scale-95 transition-all">
                            鏌ョ湅闃熷垪
                        </button>
</div>

<div className="glass-card p-6 rounded-2xl">
<h3 className="font-bold text-lg mb-4">绯荤粺鐘舵€?/h3>
<div className="space-y-3">
<div className="flex justify-between items-center text-sm">
<span className="text-on-surface-variant">API 缃戝叧</span>
<span className="text-emerald-400 font-bold">99.98%</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="w-[99%] h-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
</div>
<div className="flex justify-between items-center text-sm pt-2">
<span className="text-on-surface-variant">鍥剧墖 CDN</span>
<span className="text-emerald-400 font-bold">姝ｅ父杩愯</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="w-full h-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]"></div>
</div>
<div className="flex justify-between items-center text-sm pt-2">
<span className="text-on-surface-variant">鏁版嵁搴撻泦缇?/span>
<span className="text-tertiary font-bold">鎬ц兘涓嬮檷</span>
</div>
<div className="w-full h-1 bg-surface-container-highest rounded-full overflow-hidden">
<div className="w-[75%] h-full bg-tertiary shadow-[0_0_8px_rgba(200,160,240,0.5)]"></div>
</div>
</div>
<div className="mt-6 pt-4 border-t border-sky-300/10 flex items-center justify-between text-xs text-on-surface-variant">
<span>鑷姩鍒锋柊涓?..</span>
<span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> 鍦ㄧ嚎</span>
</div>
</div>
</div>
</div>
</div>
</main>

<button className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-on-primary rounded-2xl shadow-xl flex items-center justify-center group active:scale-90 transition-transform md:w-auto md:px-6 md:gap-3">
<span className="material-symbols-outlined" data-icon="add">add</span>
<span className="hidden md:inline font-bold">鍒涘缓鎶ュ憡</span>
</button>
</body></html>
