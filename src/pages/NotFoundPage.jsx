import React from 'react';
import { Button, Result } from 'antd';
import { useNavigate } from 'react-router-dom';
import { HomeOutlined, ArrowLeftOutlined } from '@ant-design/icons';

const NotFoundPage = () => {
    const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-[#F5F5FA]">
            <Result
                status="404"
                title={<span className="text-4xl font-bold text-[#008ECC]">404</span>}
                subTitle={<span className="text-lg text-gray-600">Xin lỗi, trang bạn truy cập không tồn tại.</span>}
                extra={
                    <div className="flex gap-4 justify-center">
                        <Button
                            type="default"
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate(-1)}
                            className="hover:border-[#008ECC] hover:text-[#008ECC]"
                            size="large"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Quay lại
                        </Button>
                        <Button
                            type="primary"
                            icon={<HomeOutlined />}
                            onClick={() => navigate('/')}
                            className="bg-[#008ECC] hover:bg-[#0077B3]"
                            size="large"
                            style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                        >
                            Về trang chủ
                        </Button>
                    </div>
                }
            />
        </div>
    );
};

export default NotFoundPage;
