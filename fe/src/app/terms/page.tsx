'use client';

import React from 'react';
import styles from './page.module.css';

export default function TermsPage() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Điều khoản dịch vụ</h1>
      <div className={styles.content}>
        <section>
          <h2>⚖️ 1. Chấp nhận điều khoản</h2>
          <p>Bằng cách truy cập và sử dụng ShikenAI, bạn đồng ý tuân thủ các điều khoản và điều kiện được nêu tại đây. Nếu bạn không đồng ý với bất kỳ phần nào của các điều khoản này, vui lòng không sử dụng dịch vụ của chúng tôi.</p>
        </section>

        <section>
          <h2>👤 2. Tài khoản người dùng</h2>
          <p>Khi tạo tài khoản, bạn phải cung cấp thông tin chính xác và đầy đủ. Bạn chịu trách nhiệm hoàn toàn về việc bảo mật mật khẩu và mọi hoạt động diễn ra dưới tài khoản của mình.</p>
        </section>

        <section>
          <h2>🛡️ 3. Quy định về gian lận</h2>
          <p>ShikenAI sử dụng công nghệ giám sát tiên tiến để phát hiện gian lận trong các kỳ thi. Mọi hành vi gian lận (bao gồm nhưng không giới hạn ở việc chuyển tab, sử dụng tài liệu ngoài, hoặc nhờ người khác làm hộ) sẽ dẫn đến việc khóa tài khoản vĩnh viễn.</p>
        </section>

        <section>
          <h2>🤝 4. Chia sẻ tài nguyên</h2>
          <p>Người dùng được khuyến khích đóng góp tài liệu cho cộng đồng. Tuy nhiên, bạn phải đảm bảo có quyền sở hữu hoặc quyền chia sẻ đối với các tài liệu này. ShikenAI không chịu trách nhiệm về nội dung do người dùng tải lên.</p>
        </section>

        <section>
          <h2>🔄 5. Thay đổi điều khoản</h2>
          <p>Chúng tôi có quyền sửa đổi các điều khoản này bất cứ lúc nào. Các thay đổi sẽ có hiệu lực ngay khi được đăng tải trên trang web.</p>
        </section>
      </div>
    </div>
  );
}
