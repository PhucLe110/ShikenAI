'use client';

import React from 'react';
import styles from './page.module.css';

export default function PrivacyPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Chính sách bảo mật</h1>
      <div className={styles.content}>
        <section>
          <h2>🔍 1. Thu thập thông tin</h2>
          <p>Chúng tôi thu thập các thông tin cơ bản như tên, địa chỉ email khi bạn đăng ký tài khoản. Ngoài ra, hệ thống cũng ghi nhận các hoạt động làm bài và luyện tập của bạn để cải thiện trải nghiệm học tập.</p>
        </section>

        <section>
          <h2>🎯 2. Sử dụng thông tin</h2>
          <p>Thông tin của bạn được sử dụng để cá nhân hóa lộ trình học tập, thông báo kết quả thi và đảm bảo tính công bằng trong các kỳ thi thông qua hệ thống giám sát tự động.</p>
        </section>

        <section>
          <h2>🔒 3. Bảo mật dữ liệu</h2>
          <p>Chúng tôi áp dụng các biện pháp bảo mật hiện đại để bảo vệ dữ liệu của bạn khỏi việc truy cập trái phép. Mật khẩu của bạn được mã hóa trước khi lưu trữ vào hệ thống.</p>
        </section>

        <section>
          <h2>🍪 4. Cookies</h2>
          <p>ShikenAI sử dụng cookies để duy trì trạng thái đăng nhập và ghi nhớ các tùy chỉnh của bạn trên trang web.</p>
        </section>

        <section>
          <h2>🌍 5. Chia sẻ với bên thứ ba</h2>
          <p>Chúng tôi cam kết không bán hoặc chia sẻ thông tin cá nhân của bạn cho bên thứ ba vì mục đích thương mại mà không có sự đồng ý của bạn.</p>
        </section>
      </div>
    </div>
  );
}
