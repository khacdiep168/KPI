export interface CriteriaOption {
  text: string;
  points: number;
  range?: number[];
}

export interface CriteriaItem {
  id: string;
  number: number;
  title: string;
  maxScore: number;
  description: string;
  options: CriteriaOption[];
}

export const KPI_CRITERIA: CriteriaItem[] = [
  {
    id: "q1",
    number: 1,
    title: "Câu 1. Tính kỷ luật",
    maxScore: 10,
    description: "Tuân thủ các quy định, nội quy công ty như: giờ làm việc, tác phong, đồng phục; đảm bảo an toàn tài sản công ty và tính mạng con người.",
    options: [
      {
        text: "9 - 10 điểm: Luôn tuân thủ quy định công ty một cách chính xác, không vi phạm và tuân thủ nghiêm túc các quy tắc công ty",
        points: 10,
        range: [9, 10]
      },
      {
        text: "7 - 8 điểm: Tuân thủ tốt quy định công ty, nhưng có thể xuất hiện một vài vi phạm nhỏ không đáng kể",
        points: 8,
        range: [7, 8]
      },
      {
        text: "5 - 6 điểm: Có một số vi phạm quy định công ty, đòi hỏi sự chú ý và điều chỉnh cần cải thiện để đạt mức đánh giá cao hơn",
        points: 6,
        range: [5, 6]
      },
      {
        text: "3 - 4 điểm: Tuân thủ quy định công ty không đạt yêu cầu, vi phạm thường xuyên",
        points: 4,
        range: [3, 4]
      }
    ]
  },
  {
    id: "q2",
    number: 2,
    title: "Câu 2. Thái độ làm việc",
    maxScore: 10,
    description: "Nhiệt tình, chủ động trong công việc, tinh thần hợp tác và tôn trọng người khác.",
    options: [
      {
        text: "9 - 10 điểm: Luôn có thái độ tích cực, hợp tác và nhiệt tình trong công việc, luôn sẵn lòng giúp đỡ đồng nghiệp và đáp ứng tốt các yêu cầu",
        points: 10,
        range: [9, 10]
      },
      {
        text: "7 - 8 điểm: Thái độ làm việc chủ động và tích cực nhưng đôi khi có thể xuất hiện tình huống gây ảnh hưởng nhỏ đến tinh thần chung",
        points: 8,
        range: [7, 8]
      },
      {
        text: "5 - 6 điểm: Thái độ làm việc chung chung, đôi khi thiếu sự nhiệt tình trong công việc. Cần cải thiện để tăng cường gắn kết",
        points: 6,
        range: [5, 6]
      },
      {
        text: "3 - 4 điểm: Thiếu nhiệt tình, thụ động, đôi khi có thái độ tiêu cực ảnh hưởng đến đồng nghiệp",
        points: 4,
        range: [3, 4]
      }
    ]
  },
  {
    id: "q3",
    number: 3,
    title: "Câu 3. Giao tiếp",
    maxScore: 10,
    description: "Giao tiếp với cấp trên, đồng nghiệp, khách hàng và đối tác; kỹ năng lắng nghe và truyền đạt thông tin.",
    options: [
      {
        text: "9 - 10 điểm: Có khả năng giao tiếp hiệu quả, dễ dàng tương tác và truyền đạt thông tin một cách rõ ràng và chuẩn mực",
        points: 10,
        range: [9, 10]
      },
      {
        text: "7 - 8 điểm: Giao tiếp tốt nhưng cần cải thiện trong việc lắng nghe và đưa ra phản hồi chính xác, kịp thời",
        points: 8,
        range: [7, 8]
      },
      {
        text: "5 - 6 điểm: Giao tiếp trung bình, có thể gặp khó khăn trong việc truyền đạt thông tin hoặc chưa lắng nghe đồng nghiệp thấu đáo",
        points: 6,
        range: [5, 6]
      },
      {
        text: "3 - 4 điểm: Giao tiếp không hiệu quả, không thể truyền đạt thông tin rõ ràng và ít lắng nghe",
        points: 4,
        range: [3, 4]
      }
    ]
  },
  {
    id: "q4",
    number: 4,
    title: "Câu 4. Mức độ hoàn thành và chất lượng công việc",
    maxScore: 30,
    description: "Hoàn thành công việc đạt mục tiêu và yêu cầu đề ra; đáp ứng chất lượng, đảm bảo tiến độ và xử lý phát sinh hiệu quả.",
    options: [
      {
        text: "Từ 28 - 30 điểm: Hoàn thành 100% mục tiêu và yêu cầu đã đề ra, chất lượng vượt trội, đúng hạn tuyệt đối và đạt hiệu suất tối ưu",
        points: 30,
        range: [28, 29, 30]
      },
      {
        text: "Từ 25 - 27 điểm: Hoàn thành gần đạt 100%, có rất ít sai sót nhỏ và vẫn đáp ứng tốt chất lượng và thời hạn đề ra",
        points: 27,
        range: [25, 26, 27]
      },
      {
        text: "Từ 23 - 24 điểm: Hoàn thành khoảng 80-90%, có một số sai sót nhỏ nhưng vẫn đáp ứng chất lượng và tiến độ yêu cầu",
        points: 24,
        range: [23, 24]
      },
      {
        text: "Từ 19 - 21 điểm: Hoàn thành khoảng 70-80%, có một số sai sót nhưng không ảnh hưởng nghiêm trọng đến kết quả chung",
        points: 21,
        range: [19, 20, 21]
      },
      {
        text: "Từ 16 - 18 điểm: Hoàn thành khoảng 60-70%, có nhiều sai sót và chất lượng công việc chưa thực sự đạt yêu cầu",
        points: 18,
        range: [16, 17, 18]
      },
      {
        text: "Từ 4 - 6 điểm: Hoàn thành dưới 30%, có rất nhiều sai sót và chất lượng công việc không đáp ứng yêu cầu",
        points: 6,
        range: [4, 5, 6]
      }
    ]
  },
  {
    id: "q5",
    number: 5,
    title: "Câu 5. Kiến thức",
    maxScore: 10,
    description: "Hiểu biết về ngành nghề kinh doanh, sản phẩm công ty và kiến thức chuyên môn phụ trách.",
    options: [
      {
        text: "Từ 9 - 10 điểm: Có kiến thức rộng và sâu. Am hiểu tường tận nghiệp vụ, quy trình và ngành nghề kinh doanh của công ty",
        points: 10,
        range: [9, 10]
      },
      {
        text: "Từ 7 - 8 điểm: Có hiểu biết sâu về công việc và có khả năng áp dụng thành thạo kiến thức vào thực tiễn hàng ngày",
        points: 8,
        range: [7, 8]
      },
      {
        text: "Từ 5 - 6 điểm: Có hiểu biết khá về tiêu chí và kiến thức cơ bản ổn định về chuyên môn và công ty",
        points: 6,
        range: [5, 6]
      },
      {
        text: "Từ 3 - 4 điểm: Chỉ nắm một số kiến thức cơ bản, chưa hiểu sâu nghiệp vụ, cần học hỏi thêm",
        points: 4,
        range: [3, 4]
      },
      {
        text: "Từ 0 - 2 điểm: Thiếu hiểu biết cơ bản, không đáp ứng được yêu cầu tối thiểu của công việc",
        points: 2,
        range: [0, 1, 2]
      }
    ]
  },
  {
    id: "q6",
    number: 6,
    title: "Câu 6. Kỹ năng",
    maxScore: 10,
    description: "Kỹ năng sắp xếp, quản lý công việc và xử lý tình huống, giải quyết vấn đề linh hoạt.",
    options: [
      {
        text: "10 điểm: Kỹ năng thành thạo vượt trội, sắp xếp khoa học và giải quyết các tình huống khó khăn xuất sắc",
        points: 10,
        range: [10]
      },
      {
        text: "9 điểm: Sử dụng tốt các kỹ năng cần thiết trong công việc, thích nghi tốt với các tình huống phát sinh",
        points: 9,
        range: [9]
      },
      {
        text: "8 điểm: Có kỹ năng khá tốt, hoàn thành công việc độc lập trong hầu hết các tình huống thường gặp",
        points: 8,
        range: [8]
      },
      {
        text: "7 điểm: Có một số kỹ năng cơ bản và sử dụng được trong công việc, có thể thích nghi trong mức độ vừa phải",
        points: 7,
        range: [7]
      },
      {
        text: "6 điểm: Kỹ năng ở mức trung bình, chưa sử dụng hiệu quả và cần thêm thời gian để hoàn thiện",
        points: 6,
        range: [6]
      },
      {
        text: "5 điểm: Kỹ năng hạn chế, cần nỗ lực nhiều hơn và có sự hướng dẫn thường xuyên từ cấp trên",
        points: 5,
        range: [5]
      },
      {
        text: "4 điểm: Có kỹ năng nhưng chưa sử dụng đúng cách trong công việc",
        points: 4,
        range: [4]
      },
      {
        text: "3 điểm: Kỹ năng yếu, chưa đáp ứng yêu cầu công việc",
        points: 3,
        range: [3]
      },
      {
        text: "2 điểm: Thiếu hầu hết các kỹ năng cần thiết",
        points: 2,
        range: [2]
      },
      {
        text: "1 điểm: Không có kỹ năng thực hiện công việc",
        points: 1,
        range: [1]
      }
    ]
  },
  {
    id: "q7",
    number: 7,
    title: "Câu 7. Sự đổi mới & Ứng dụng công nghệ",
    maxScore: 5,
    description: "Khả năng ứng dụng công nghệ, phần mềm quản lý và tinh thần đổi mới sáng tạo trong công việc.",
    options: [
      {
        text: "5 điểm: Chủ động áp dụng công nghệ và công cụ mới mang lại năng suất cao vượt trội cho bộ phận",
        points: 5,
        range: [5]
      },
      {
        text: "4 điểm: Sử dụng thành thạo công nghệ hiện có và có ý thức áp dụng đổi mới vào quy trình làm việc",
        points: 4,
        range: [4]
      },
      {
        text: "3 điểm: Có ý thức về đổi mới và công nghệ, nhưng cần trau dồi thêm kỹ năng thao tác thực tế",
        points: 3,
        range: [3]
      },
      {
        text: "2 điểm: Khả năng đổi mới còn hạn chế, chậm tiếp thu công cụ công nghệ mới",
        points: 2,
        range: [2]
      },
      {
        text: "1 điểm: Không có sự đổi mới, ngại tiếp cận hoặc từ chối sử dụng công nghệ",
        points: 1,
        range: [1]
      }
    ]
  },
  {
    id: "q8",
    number: 8,
    title: "Câu 8. Khả năng tương tác, hợp tác tập thể",
    maxScore: 5,
    description: "Tích cực tương tác, tham gia các hoạt động tập thể, phong trào công ty và hỗ trợ đồng đội.",
    options: [
      {
        text: "5 điểm: Tinh thần đồng đội xuất sắc, luôn tiên phong tham gia phong trào và nhiệt tình giúp đỡ mọi người",
        points: 5,
        range: [5]
      },
      {
        text: "4 điểm: Hợp tác tập thể tích cực, thường xuyên hỗ trợ đồng nghiệp khi có yêu cầu",
        points: 4,
        range: [4]
      },
      {
        text: "3 điểm: Hợp tác ở mức trung bình, tham gia vừa đủ các hoạt động khi được giao nhiệm vụ",
        points: 3,
        range: [3]
      },
      {
        text: "2 điểm: Ít tương tác tập thể, thụ động, chủ yếu làm việc độc lập cá nhân",
        points: 2,
        range: [2]
      },
      {
        text: "1 điểm: Thiếu hợp tác, thờ ơ với phong trào tập thể hoặc gây khó khăn cho đồng đội",
        points: 1,
        range: [1]
      }
    ]
  },
  {
    id: "q9",
    number: 9,
    title: "Câu 9. Sự phát triển bản thân",
    maxScore: 5,
    description: "Khả năng tự học hỏi, cập nhật kiến thức chuyên môn mới và nỗ lực nâng cao năng lực cá nhân.",
    options: [
      {
        text: "5 điểm: Liên tục tự học, tìm tòi kiến thức mới, cầu tiến và nâng cao trình độ rõ rệt theo thời gian",
        points: 5,
        range: [5]
      },
      {
        text: "4 điểm: Có ý thức tự giác học hỏi, cập nhật kiến thức liên quan đến công việc thường xuyên",
        points: 4,
        range: [4]
      },
      {
        text: "3 điểm: Có ý thức phát triển bản thân ở mức vừa phải, chỉ học khi công việc đòi hỏi bắt buộc",
        points: 3,
        range: [3]
      },
      {
        text: "2 điểm: Ít quan tâm đến việc nâng cao năng lực, bằng lòng với kiến thức hiện có",
        points: 2,
        range: [2]
      },
      {
        text: "1 điểm: Không có tinh thần học hỏi, trì trệ trong việc phát triển kỹ năng mới",
        points: 1,
        range: [1]
      }
    ]
  },
  {
    id: "q10",
    number: 10,
    title: "Câu 10. Đóng góp, ý tưởng sáng tạo, cải tiến công việc",
    maxScore: 5,
    description: "Đóng góp sáng kiến, ý tưởng cải tiến quy trình, tiết kiệm thời gian/chi phí và tăng năng suất.",
    options: [
      {
        text: "5 điểm: Có sáng kiến đột phá, đóng góp ý tưởng cải tiến có giá trị thực tiễn cao cho công ty",
        points: 5,
        range: [5]
      },
      {
        text: "4 điểm: Thường xuyên đề xuất các giải pháp hợp lý, giúp tối ưu hóa công việc hiệu quả",
        points: 4,
        range: [4]
      },
      {
        text: "3 điểm: Thỉnh thoảng đóng góp ý kiến mang tính xây dựng trong các buổi họp bộ phận",
        points: 3,
        range: [3]
      },
      {
        text: "2 điểm: Rất ít khi đưa ra ý kiến hay đề xuất cải tiến nào cho công việc",
        points: 2,
        range: [2]
      },
      {
        text: "1 điểm: Hoàn toàn không có sáng kiến hoặc từ chối tham gia đóng góp ý kiến",
        points: 1,
        range: [1]
      }
    ]
  }
];

export function calculateClassification(totalScore: number): "Xuất sắc" | "Giỏi" | "Khá" | "Trung Bình" | "Yếu" {
  if (totalScore >= 90) return "Xuất sắc";
  if (totalScore >= 80) return "Giỏi";
  if (totalScore >= 65) return "Khá";
  if (totalScore >= 50) return "Trung Bình";
  return "Yếu";
}
