import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const papers = [
  {
    title: "Attention Is All You Need",
    authors: JSON.stringify(["Ashish Vaswani", "Noam Shazeer", "Niki Parmar"]),
    abstract: "The dominant sequence transduction models are based on complex recurrent or convolutional neural networks.",
    keywords: JSON.stringify(["transformer", "attention", "neural network"]),
    url: "https://arxiv.org/abs/1706.03762",
    year: 2017,
    journal: "NeurIPS",
    doi: "10.48550/arXiv.1706.03762",
  },
  {
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    authors: JSON.stringify(["Jacob Devlin", "Ming-Wei Chang", "Kenton Lee"]),
    abstract: "We introduce a new language representation model called BERT.",
    keywords: JSON.stringify(["BERT", "NLP", "pre-training", "transformer"]),
    url: "https://arxiv.org/abs/1810.04805",
    year: 2018,
    journal: "NAACL",
  },
  {
    title: "Deep Residual Learning for Image Recognition",
    authors: JSON.stringify(["Kaiming He", "Xiangyu Zhang", "Shaoqing Ren", "Jian Sun"]),
    abstract: "Deeper neural networks are more difficult to train. We present a residual learning framework.",
    keywords: JSON.stringify(["ResNet", "deep learning", "image recognition", "CNN"]),
    url: "https://arxiv.org/abs/1512.03385",
    year: 2015,
    journal: "CVPR",
    doi: "10.1109/CVPR.2016.90",
  },
  {
    title: "Generative Adversarial Networks",
    authors: JSON.stringify(["Ian Goodfellow", "Jean Pouget-Abadie", "Mehdi Mirza"]),
    abstract: "We propose a new framework for estimating generative models via an adversarial process.",
    keywords: JSON.stringify(["GAN", "generative model", "adversarial training"]),
    url: "https://arxiv.org/abs/1406.2661",
    year: 2014,
    journal: "NeurIPS",
  },
  {
    title: "ImageNet Classification with Deep Convolutional Neural Networks",
    authors: JSON.stringify(["Alex Krizhevsky", "Ilya Sutskever", "Geoffrey Hinton"]),
    abstract: "We trained a large, deep convolutional neural network to classify the 1.2 million images in the ImageNet LSVRC-2010 contest.",
    keywords: JSON.stringify(["AlexNet", "CNN", "ImageNet", "deep learning"]),
    url: "https://papers.nips.cc/paper/4824-imagenet-classification-with-deep-convolutional-neural-networks",
    year: 2012,
    journal: "NeurIPS",
  },
];

async function main() {
  console.log("Seeding database...");
  for (const paper of papers) {
    await prisma.paper.create({ data: paper });
  }
  console.log(`Seeded ${papers.length} papers.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
