import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

interface VoteData {
    juryVotes: number | null;
    audienceVotes: number | null;
}

interface GroupVotes {
    group1: VoteData;
    group2: VoteData;
}

interface ChartData {
    name: string;
    总分: number;
    评委得分: number;
    观众得分: number;
    显示高度: number;
}

const VotePreviewTool: React.FC = () => {
    const [votes, setVotes] = useState<GroupVotes>({
        group1: { juryVotes: null, audienceVotes: null },
        group2: { juryVotes: null, audienceVotes: null }
    });

    const parseInputValue = (value: string): number | null => {
        if (value === '') return null;
        const num = parseFloat(value);
        return isNaN(num) ? null : num;
    };

    const calculateJuryScore = (juryVotes: number | null, maxJuryVotes: number): number => {
        if (juryVotes === null || maxJuryVotes === 0) return 14;
        return 14 + 56 * (juryVotes / 70) * (Math.log(1 + juryVotes) / Math.log(1 + maxJuryVotes));
    };

    const calculateAudienceScore = (audienceVotes: number | null, maxAudienceVotes: number): number => {
        if (audienceVotes === null || maxAudienceVotes === 0) return 6;
        return 6 + 24 * (audienceVotes / 120) * (Math.log(1 + audienceVotes) / Math.log(1 + maxAudienceVotes));
    };

    const calculateHeight = (score: number): number => {
        let extraHeight = 0;

        if (score >= 20 && score < 60) {
            extraHeight = (score - 20) / 80;
        } else if (score >= 60 && score < 80) {
            extraHeight = (60 - 20) / 80 + 0.6 * (score - 60) / 80;
        } else if (score >= 80 && score < 90) {
            extraHeight = (60 - 20) / 80 + 0.6 * (80 - 60) / 80 + 0.4 * (score - 80) / 80;
        } else if (score >= 90 && score <= 100) {
            extraHeight = (60 - 20) / 80 + 0.6 * (80 - 60) / 80 + 0.4 * (90 - 80) / 80 + 0.2 * (score - 90) / 80;
        }

        return 0.2 + extraHeight;
    };

    const calculateData = (): ChartData[] => {
        const maxJuryVotes = Math.max(
            votes.group1.juryVotes ?? 0,
            votes.group2.juryVotes ?? 0
        );
        const maxAudienceVotes = Math.max(
            votes.group1.audienceVotes ?? 0,
            votes.group2.audienceVotes ?? 0
        );

        return ['group1', 'group2'].map(group => {
            const currentGroup = votes[group as keyof GroupVotes];
            const juryScore = calculateJuryScore(currentGroup.juryVotes, maxJuryVotes);
            const audienceScore = calculateAudienceScore(currentGroup.audienceVotes, maxAudienceVotes);
            const totalScore = juryScore + audienceScore;

            return {
                name: group === 'group1' ? '参赛组1' : '参赛组2',
                总分: parseFloat(totalScore.toFixed(2)),
                评委得分: parseFloat(juryScore.toFixed(2)),
                观众得分: parseFloat(audienceScore.toFixed(2)),
                显示高度: parseFloat((calculateHeight(totalScore) * 100).toFixed(2))
            };
        });
    };

    const renderCalculationDetails = () => {
        const data = calculateData();
        const maxJuryVotes = Math.max(votes.group1.juryVotes ?? 0, votes.group2.juryVotes ?? 0);
        const maxAudienceVotes = Math.max(votes.group1.audienceVotes ?? 0, votes.group2.audienceVotes ?? 0);

        return data.map((group, index) => (
            <div key={group.name} className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg shadow-sm">
                <h4 className="font-bold text-blue-900 mb-2">{group.name}计算过程：</h4>
                <div className="space-y-2 text-sm text-blue-800">
                    <p><span className="font-medium text-blue-900">评委得分计算：</span></p>
                    <p className="ml-4">基础分：14分</p>
                    {votes[`group${index + 1}` as keyof GroupVotes].juryVotes !== null && (
                        <p className="ml-4">
                            动态得分：56 × ({votes[`group${index + 1}` as keyof GroupVotes].juryVotes} / 70) ×
                            ln(1 + {votes[`group${index + 1}` as keyof GroupVotes].juryVotes}) /
                            ln(1 + {maxJuryVotes}) = {(group.评委得分 - 14).toFixed(2)}
                        </p>
                    )}
                    <p className="ml-4 text-blue-900 font-medium">最终评委得分：{group.评委得分}分</p>

                    <p className="mt-2"><span className="font-medium text-blue-900">观众得分计算：</span></p>
                    <p className="ml-4">基础分：6分</p>
                    {votes[`group${index + 1}` as keyof GroupVotes].audienceVotes !== null && (
                        <p className="ml-4">
                            动态得分：24 × ({votes[`group${index + 1}` as keyof GroupVotes].audienceVotes} / 120) ×
                            ln(1 + {votes[`group${index + 1}` as keyof GroupVotes].audienceVotes}) /
                            ln(1 + {maxAudienceVotes}) = {(group.观众得分 - 6).toFixed(2)}
                        </p>
                    )}
                    <p className="ml-4 text-blue-900 font-medium">最终观众得分：{group.观众得分}分</p>

                    <div className="mt-4 pt-2 border-t border-blue-200">
                        <p className="font-medium text-blue-900">最终结果：</p>
                        <p className="ml-4">总分：{group.总分}分</p>
                        <p className="ml-4">显示高度：{group.显示高度}%</p>
                    </div>
                </div>
            </div>
        ));
    };

    return (
        <div className="p-4">
            <div className="mb-8 grid grid-cols-2 gap-4">
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">参赛组1</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">评委投票 (0-70)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={votes.group1.juryVotes === null ? '' : votes.group1.juryVotes}
                            onChange={(e) => {
                                const value = parseInputValue(e.target.value);
                                if (value === null || (value >= 0 && value <= 70)) {
                                    setVotes({
                                        ...votes,
                                        group1: { ...votes.group1, juryVotes: value }
                                    });
                                }
                            }}
                            placeholder="请输入0-70之间的数值"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">观众投票 (0-120)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={votes.group1.audienceVotes === null ? '' : votes.group1.audienceVotes}
                            onChange={(e) => {
                                const value = parseInputValue(e.target.value);
                                if (value === null || (value >= 0 && value <= 120)) {
                                    setVotes({
                                        ...votes,
                                        group1: { ...votes.group1, audienceVotes: value }
                                    });
                                }
                            }}
                            placeholder="请输入0-120之间的数值"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">参赛组2</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">评委投票 (0-70)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={votes.group2.juryVotes === null ? '' : votes.group2.juryVotes}
                            onChange={(e) => {
                                const value = parseInputValue(e.target.value);
                                if (value === null || (value >= 0 && value <= 70)) {
                                    setVotes({
                                        ...votes,
                                        group2: { ...votes.group2, juryVotes: value }
                                    });
                                }
                            }}
                            placeholder="请输入0-70之间的数值"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">观众投票 (0-120)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 shadow-sm px-3 py-2 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            value={votes.group2.audienceVotes === null ? '' : votes.group2.audienceVotes}
                            onChange={(e) => {
                                const value = parseInputValue(e.target.value);
                                if (value === null || (value >= 0 && value <= 120)) {
                                    setVotes({
                                        ...votes,
                                        group2: { ...votes.group2, audienceVotes: value }
                                    });
                                }
                            }}
                            placeholder="请输入0-120之间的数值"
                        />
                    </div>
                </div>
            </div>

            <div className="space-y-8">
                <div>
                    <h3 className="font-bold text-lg mb-4">得分图表(不在前端呈现)</h3>
                    <BarChart width={600} height={400} data={calculateData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <ReferenceLine y={20} stroke="#666" strokeDasharray="3 3" />
                        <ReferenceLine y={60} stroke="#666" strokeDasharray="3 3" />
                        <ReferenceLine y={80} stroke="#666" strokeDasharray="3 3" />
                        <ReferenceLine y={90} stroke="#666" strokeDasharray="3 3" />
                        <Bar dataKey="总分" fill="#8884d8" />
                        <Bar dataKey="评委得分" fill="#82ca9d" />
                        <Bar dataKey="观众得分" fill="#ffc658" />
                    </BarChart>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4">显示高度预览</h3>
                    <BarChart width={600} height={400} data={calculateData()}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Legend />
                        <ReferenceLine y={20} stroke="#666" strokeDasharray="3 3" />
                        <Bar dataKey="显示高度" fill="#8884d8" />
                    </BarChart>
                </div>

                <div>
                    <h3 className="font-bold text-lg mb-4">计算过程详情</h3>
                    {renderCalculationDetails()}
                </div>
            </div>
        </div>
    );
};

export default VotePreviewTool;