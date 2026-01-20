import { ANIM, MotionA, MotionDiv } from "../../lib/motion";
import { safeEntry } from "../../lib/safe";
import { IslandProps } from "../../types";
import { Button } from "../../ui/shadcn/button";

const DEFAUT_DATA: NewsContent = {
    items: [
        {
            title: "Launch of New Product",
            date: "2024-06-01",
            category: "Product",
            description: "We are excited to announce the launch of our new product that will revolutionize the industry.",
            imageUrl: "https://images.unsplash.com/photo-1577962917302-cd874c4e31d2?q=80&w=1000&auto=format&fit=crop",
            url: "/news/launch-of-new-product"
        },
        {
            title: "Company Achieves Milestone",
            date: "2024-05-15",
            category: "Company",
            description: "Our company has reached a significant milestone with over 1 million users worldwide.",
            imageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1000&auto=format&fit=crop",
            url: "/news/company-achieves-milestone"
        },
        {
            title: "Upcoming Webinar on Industry Trends",
            date: "2024-06-10",
            category: "Events",
            description: "Join us for an insightful webinar discussing the latest trends in the industry.",
            imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1000&auto=format&fit=crop",
            url: "/news/upcoming-webinar-on-industry-trends"
        },
        {
            title: "Partnership Announcement",
            date: "2024-04-20",
            category: "Partnerships",
            description: "We are thrilled to announce our new partnership with a leading company in the tech space.",
            imageUrl: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?q=80&w=1000&auto=format&fit=crop",
            url: "/news/partnership-announcement"
        }
    ]
};

type NewsItem = {
    title: string;
    date: string;
    category: string;
    description: string;
    imageUrl?: string;
    url: string;
}

type NewsContent = {
    items: NewsItem[];
}

const News = ({Data = {}}: IslandProps) => {
    const content = safeEntry<NewsContent>(Data || {}, DEFAUT_DATA);
    const items = content.items;

    return (
        <section className="bg-primary-950/5 py-24 border-t border-netral-800">
            <div className="container mx-auto px-6">
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
                    <MotionDiv initial="hidden" whileInView="show" viewport={{ once: false }} variants={ANIM.slideRight}>
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-2">Berita & Kegiatan</h2>
                        <p className="text-netral-400">Update terbaru seputar pengawasan di Kalimantan Barat.</p>
                    </MotionDiv>
                    <Button variant="outline" className="border-netral-700 text-white hover:bg-netral-800">
                        Lihat Semua Berita
                    </Button>
                </div>

                <MotionDiv 
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.2 }}
                    variants={ANIM.container}
                    className="grid grid-cols-1 md:grid-cols-3 gap-8"
                >
                    {items.map((news, idx) => (
                        <MotionA
                            href={news.url} 
                            key={idx} 
                            variants={ANIM.flipIn} // Efek Kartu Berputar
                            whileHover={{ scale: 1.02 }}
                            className="group block"
                        >
                            <div className="relative overflow-hidden rounded-xl bg-netral-800 aspect-video mb-4 border border-netral-800 group-hover:border-netral-600 transition-all">
                                <img 
                                    src={news.imageUrl} 
                                    alt={news.title}
                                    className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" 
                                />
                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-xs font-medium text-white border border-white/10">
                                    {news.category}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-xs text-primary-400 font-mono">{news.date}</span>
                                <h3 className="text-lg font-bold text-white group-hover:text-primary-400 transition-colors line-clamp-2">
                                    {news.title}
                                </h3>
                                <p className="text-netral-400 text-sm line-clamp-2">
                                    {news.description}
                                </p>
                            </div>
                        </MotionA>
                    ))}
                </MotionDiv>
            </div>
        </section>
    );
}

export default News