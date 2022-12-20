import {
  Modal, Row, Col, Image,
} from 'antd';
import image1 from '@/assets/wallpaper/62847.jpg';
import image2 from '@/assets/wallpaper/62850.jpg';
import image3 from '@/assets/wallpaper/62852.jpg';

export interface IWallpaperProps {
  open: boolean
}

export default function Wallpaper({ open }: IWallpaperProps) {
  const loading = false;
  return (
    <Modal
      title="壁纸设置"
      open={open}
      closable={!loading}
      maskClosable={false}
      keyboard={false}
      okButtonProps={{
        loading,
      }}
      cancelButtonProps={{
        loading,
      }}
    >
      <Row gutter={16}>
        {[image1, image2, image3].map((item) => (
          <Col key={item} span={6}>
            <Image width={200} src={item} />
          </Col>
        ))}
      </Row>
    </Modal>
  );
}
