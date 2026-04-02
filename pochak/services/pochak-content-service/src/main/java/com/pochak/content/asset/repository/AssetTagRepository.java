package com.pochak.content.asset.repository;

import com.pochak.content.asset.entity.AssetTag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AssetTagRepository extends JpaRepository<AssetTag, Long> {

    List<AssetTag> findByAssetTypeAndAssetIdOrderByTagTimeSecAsc(String assetType, Long assetId);

    List<AssetTag> findByAssetTypeAndAssetIdAndDeletedAtIsNullOrderByTagTimeSecAsc(String assetType, Long assetId);
}
