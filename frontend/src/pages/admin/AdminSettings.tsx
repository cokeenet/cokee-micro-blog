export default function AdminSettings() {
    return (
        <div className="flex flex-col gap-6">
            <div>
                <h2 className="text-2xl font-black tracking-tight text-on-surface">系统设置</h2>
                <p className="text-sm text-on-surface-variant mt-1">全局核心配置与功能开关</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-surface border border-outline-variant/40 rounded-[24px] shadow-sm p-6 flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">security</span>
                        安全与注册
                    </h3>

                    <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
                        <div>
                            <p className="font-semibold text-on-surface">开放注册</p>
                            <p className="text-xs text-on-surface-variant">允许新用户自行通过首页表单注册账号</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
                        <div>
                            <p className="font-semibold text-on-surface">强制邮件验证</p>
                            <p className="text-xs text-on-surface-variant">新注册账号必须激活后才可发布内容</p>
                        </div>
                        <input type="checkbox" className="w-5 h-5 accent-primary cursor-pointer" />
                    </div>

                    <div className="flex items-center justify-between border-b border-outline-variant/40 pb-4">
                        <div>
                            <p className="font-semibold text-on-surface">防灌水机制 (Rate Limit)</p>
                            <p className="text-xs text-on-surface-variant">严格限制单 IP 短时间内的发帖与评论频次</p>
                        </div>
                        <input type="checkbox" defaultChecked className="w-5 h-5 accent-primary cursor-pointer" />
                    </div>
                </div>

                <div className="bg-surface border border-outline-variant/40 rounded-[24px] shadow-sm p-6 flex flex-col gap-6">
                    <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">cloud_sync</span>
                        存储与接口
                    </h3>

                    <div className="flex flex-col border-b border-outline-variant/40 pb-4 gap-2">
                        <p className="font-semibold text-on-surface">多媒体云存储网关</p>
                        <input
                            className="w-full text-sm bg-surface-variant/40 border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                            defaultValue="https://s3.glacier-microblog.com"
                        />
                    </div>

                    <div className="flex flex-col border-b border-outline-variant/40 pb-4 gap-2">
                        <p className="font-semibold text-on-surface">图片上传体积上限 (MB)</p>
                        <input
                            type="number"
                            className="w-full text-sm bg-surface-variant/40 border border-outline-variant/60 rounded px-3 py-2 text-on-surface focus:outline-none focus:border-primary"
                            defaultValue="5"
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <button className="bg-primary text-white font-bold px-8 py-2 rounded-full hover:opacity-90">
                            保存修改
                        </button>
                    </div>
                </div>
            </div>

            <div className="bg-red-500/5 border border-red-500/30 rounded-[24px] shadow-sm p-6 flex flex-col gap-4 mt-4">
                <h3 className="text-lg font-bold text-red-500 flex items-center gap-2">
                    <span className="material-symbols-outlined">warning</span>
                    危险操作区域
                </h3>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="font-semibold text-on-surface">清空所有缓存</p>
                        <p className="text-xs text-on-surface-variant">清空 Redis 和本地内存的推文缓存，这可能导致短时间内数据库压力突增。</p>
                    </div>
                    <button className="text-red-500 border border-red-500/50 hover:bg-red-500/10 px-4 py-2 rounded-full font-bold transition-colors text-sm">
                        执行清空
                    </button>
                </div>
            </div>
        </div>
    );
}