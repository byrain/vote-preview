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

    return (
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
                    <h3 className="font-bold text-lg mb-4">得分图表</h3>
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
            </div>
        </div>
    );
};

export default VotePreviewTool;