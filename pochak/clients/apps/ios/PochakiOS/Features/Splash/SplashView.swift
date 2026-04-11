// SplashView.swift
// Pochak OTT Platform - GIF Splash Screen
// Displays pochak_splash.gif (portrait) on green background

import SwiftUI
import UIKit
import ImageIO

struct SplashView: View {

    var onComplete: () -> Void

    @State private var hasCompleted = false

    private let splashGreen = Color(red: 0, green: 199.0/255.0, blue: 0)

    var body: some View {
        ZStack {
            splashGreen.ignoresSafeArea()

            AnimatedGIFView(gifName: "pochak_splash")
                .ignoresSafeArea()
        }
        .statusBarHidden(true)
        .task {
            // Auto-complete after GIF plays (~4s) with safety margin
            try? await Task.sleep(nanoseconds: 4_500_000_000)
            completeOnce()
        }
        .accessibilityLabel("Splash screen")
    }

    private func completeOnce() {
        guard !hasCompleted else { return }
        hasCompleted = true
        onComplete()
    }
}

// MARK: - Animated GIF UIViewRepresentable

private struct AnimatedGIFView: UIViewRepresentable {

    let gifName: String

    func makeUIView(context: Context) -> UIView {
        let container = UIView()
        container.backgroundColor = .clear

        guard let url = Bundle.main.url(forResource: gifName, withExtension: "gif"),
              let data = try? Data(contentsOf: url),
              let source = CGImageSourceCreateWithData(data as CFData, nil) else {
            return container
        }

        let frameCount = CGImageSourceGetCount(source)
        var images: [UIImage] = []
        var totalDuration: Double = 0

        for i in 0..<frameCount {
            if let cgImage = CGImageSourceCreateImageAtIndex(source, i, nil) {
                images.append(UIImage(cgImage: cgImage))

                // Get frame duration
                if let properties = CGImageSourceCopyPropertiesAtIndex(source, i, nil) as? [String: Any],
                   let gifDict = properties[kCGImagePropertyGIFDictionary as String] as? [String: Any] {
                    let delay = gifDict[kCGImagePropertyGIFUnclampedDelayTime as String] as? Double
                        ?? gifDict[kCGImagePropertyGIFDelayTime as String] as? Double
                        ?? 0.1
                    totalDuration += delay
                }
            }
        }

        let imageView = UIImageView()
        imageView.animationImages = images
        imageView.animationDuration = totalDuration
        imageView.animationRepeatCount = 1
        imageView.contentMode = .scaleAspectFill
        imageView.clipsToBounds = true
        imageView.backgroundColor = .clear
        imageView.translatesAutoresizingMaskIntoConstraints = false
        container.addSubview(imageView)

        NSLayoutConstraint.activate([
            imageView.topAnchor.constraint(equalTo: container.topAnchor),
            imageView.bottomAnchor.constraint(equalTo: container.bottomAnchor),
            imageView.leadingAnchor.constraint(equalTo: container.leadingAnchor),
            imageView.trailingAnchor.constraint(equalTo: container.trailingAnchor),
        ])

        imageView.startAnimating()

        // Show last frame after animation completes
        if let lastImage = images.last {
            imageView.image = lastImage
        }

        return container
    }

    func updateUIView(_ uiView: UIView, context: Context) {}
}

// MARK: - Preview

#Preview {
    SplashView(onComplete: {})
}
