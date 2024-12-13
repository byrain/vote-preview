import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine } from 'recharts';

interface VoteData {
    juryVotes: number;
    audienceVotes: number;
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
        group1: { juryVotes: 0, audienceVotes: 0 },
        group2: { juryVotes: 0, audienceVotes: 0 },
    });

    // 处理输入变化的函数
    const handleInputChange = (
        group: 'group1' | 'group2',
        type: 'juryVotes' | 'audienceVotes',
        value: string
    ) => {
        const numValue = value === '' ? 0 : Number(value);
        const maxValue = type === 'juryVotes' ? 70 : 120;

        if (numValue >= 0 && numValue <= maxValue) {
            setVotes(prev => ({
                ...prev,
                [group]: {
                    ...prev[group],
                    [type]: numValue
                }
            }));
        }
    };

    const calculateJuryScore = (juryVotes: number, maxJuryVotes: number): number => {
        if (maxJuryVotes === 0) return 14;
        return 14 + 56 * (juryVotes / 70) * (Math.log(1 + juryVotes) / Math.log(1 + maxJuryVotes));
    };

    const calculateAudienceScore = (audienceVotes: number, maxAudienceVotes: number): number => {
        if (maxAudienceVotes === 0) return 6;
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
        const maxJuryVotes = Math.max(votes.group1.juryVotes, votes.group2.juryVotes);
        const maxAudienceVotes = Math.max(votes.group1.audienceVotes, votes.group2.audienceVotes);

        return ['group1', 'group2'].map(group => {
            const currentGroup = votes[group as keyof GroupVotes];
            const juryScore = calculateJuryScore(currentGroup.juryVotes, maxJuryVotes);
            const audienceScore = calculateAudienceScore(currentGroup.audienceVotes, maxAudienceVotes);
            const totalScore = juryScore + audienceScore;

            return {
                name: group === 'group1' ? '参赛组1' : '参赛组2',
                总分: totalScore,
                评委得分: juryScore,
                观众得分: audienceScore,
                显示高度: calculateHeight(totalScore) * 100
            };
        });
    };

    // 新增：获取计算过程的详细说明
    const getCalculationDetails = () => {
        const maxJuryVotes = Math.max(votes.group1.juryVotes, votes.group2.juryVotes);
        const maxAudienceVotes = Math.max(votes.group1.audienceVotes, votes.group2.audienceVotes);

        return ['group1', 'group2'].map(group => {
            const currentGroup = votes[group as keyof GroupVotes];
            const juryVotes = currentGroup.juryVotes;
            const audienceVotes = currentGroup.audienceVotes;

            const juryScore = calculateJuryScore(juryVotes, maxJuryVotes);
            const audienceScore = calculateAudienceScore(audienceVotes, maxAudienceVotes);
            const totalScore = juryScore + audienceScore;

            return {
                name: group === 'group1' ? '参赛组1' : '参赛组2',
                details: {
                    jury: {
                        formula: `14 + 56 × (${juryVotes}/70) × ln(1+${juryVotes})/ln(1+${maxJuryVotes})`,
                        result: juryScore.toFixed(2)
                    },
                    audience: {
                        formula: `6 + 24 × (${audienceVotes}/120) × ln(1+${audienceVotes})/ln(1+${maxAudienceVotes})`,
                        result: audienceScore.toFixed(2)
                    },
                    total: totalScore.toFixed(2),
                    height: (calculateHeight(totalScore) * 100).toFixed(2)
                }
            };
        });
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
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={votes.group1.juryVotes || ''}
                            onChange={(e) => handleInputChange('group1', 'juryVotes', e.target.value)}
                            placeholder="输入0-70之间的数字"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">观众投票 (0-120)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={votes.group1.audienceVotes || ''}
                            onChange={(e) => handleInputChange('group1', 'audienceVotes', e.target.value)}
                            placeholder="输入0-120之间的数字"
                        />
                    </div>
                </div>
                <div className="space-y-4">
                    <h3 className="font-bold text-lg">参赛组2</h3>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">评委投票 (0-70)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={votes.group2.juryVotes || ''}
                            onChange={(e) => handleInputChange('group2', 'juryVotes', e.target.value)}
                            placeholder="输入0-70之间的数字"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">观众投票 (0-120)</label>
                        <input
                            type="text"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                            value={votes.group2.audienceVotes || ''}
                            onChange={(e) => handleInputChange('group2', 'audienceVotes', e.target.value)}
                            placeholder="输入0-120之间的数字"
                        />
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="mb-8 grid grid-cols-2 gap-4">
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">参赛组1</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">评委投票 (0-70)</label>
                            <input
                                type="number"
                                min="0"
                                max="70"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={votes.group1.juryVotes}
                                onChange={(e) => setVotes({
                                    ...votes,
                                    group1: { ...votes.group1, juryVotes: Number(e.target.value) }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">观众投票 (0-120)</label>
                            <input
                                type="number"
                                min="0"
                                max="120"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={votes.group1.audienceVotes}
                                onChange={(e) => setVotes({
                                    ...votes,
                                    group1: { ...votes.group1, audienceVotes: Number(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h3 className="font-bold text-lg">参赛组2</h3>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">评委投票 (0-70)</label>
                            <input
                                type="number"
                                min="0"
                                max="70"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={votes.group2.juryVotes}
                                onChange={(e) => setVotes({
                                    ...votes,
                                    group2: { ...votes.group2, juryVotes: Number(e.target.value) }
                                })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">观众投票 (0-120)</label>
                            <input
                                type="number"
                                min="0"
                                max="120"
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                                value={votes.group2.audienceVotes}
                                onChange={(e) => setVotes({
                                    ...votes,
                                    group2: { ...votes.group2, audienceVotes: Number(e.target.value) }
                                })}
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div>
                        <h3 className="font-bold text-lg mb-4">得分图表(仅用于统计分数)</h3>
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

                    <div className="mt-8 space-y-6">
                        <h3 className="font-bold text-lg">计算过程详情</h3>
                        {getCalculationDetails().map((group, index) => (
                            <div key={index} className="p-4 bg-gray-50 rounded-lg">
                                <h4 className="font-bold mb-2">{group.name}</h4>
                                <div className="space-y-2">
                                    <div>
                                        <p className="font-medium">评委得分计算：</p>
                                        <p className="ml-4 text-sm font-mono">{group.details.jury.formula}</p>
                                        <p className="ml-4">= {group.details.jury.result}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">观众得分计算：</p>
                                        <p className="ml-4 text-sm font-mono">{group.details.audience.formula}</p>
                                        <p className="ml-4">= {group.details.audience.result}</p>
                                    </div>
                                    <div>
                                        <p className="font-medium">总分：{group.details.total}</p>
                                        <p className="font-medium">显示高度：{group.details.height}%</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
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
            </div>
        </div>

    );
};

export default VotePreviewTool;